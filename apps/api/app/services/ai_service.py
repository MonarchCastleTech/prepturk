"""AI service - AI chat orchestration with prompt templates."""

import os
import json
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

PROMPTS_PATH = Path(os.getenv("AI_PROMPTS_PATH", "content/manifests/taxonomy/ai-prompts.json"))


class AIService:
    """Handles AI chat orchestration using predefined prompt templates."""

    def __init__(self, prompts_path: Optional[Path] = None):
        self.prompts_path = prompts_path or PROMPTS_PATH
        self._prompt_templates: dict = {}
        self._system_defaults: dict = {}
        self._special_modes: dict = {}
        self._load_templates()

    def _load_templates(self):
        """Load prompt templates from the taxonomy file."""
        if not self.prompts_path.exists():
            logger.warning("Prompt templates not found at %s", self.prompts_path)
            return

        try:
            with open(self.prompts_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            for prompt in data.get("prompts", []):
                self._prompt_templates[prompt["id"]] = prompt

            self._system_defaults = data.get("system_defaults", {})
            self._special_modes = data.get("special_modes", {})
            logger.info("Loaded %d prompt templates", len(self._prompt_templates))

        except (json.JSONDecodeError, IOError) as e:
            logger.error("Failed to load prompt templates: %s", e)

    def get_prompt_template(self, template_id: str) -> Optional[dict]:
        """Get a prompt template by ID."""
        return self._prompt_templates.get(template_id)

    def get_all_templates(self) -> list[dict]:
        """Return all available prompt templates."""
        return list(self._prompt_templates.values())

    def get_system_defaults(self) -> dict:
        """Get the default system prompt settings."""
        return self._system_defaults

    def get_special_mode(self, mode_id: str) -> Optional[dict]:
        """Get a special mode configuration (emergency, child-safe, vault)."""
        return self._special_modes.get(mode_id)

    def get_all_special_modes(self) -> dict:
        """Return all special mode configurations."""
        return self._special_modes

    def build_chat_payload(
        self,
        template_id: str,
        user_input: str,
        variables: Optional[dict] = None,
        mode: Optional[str] = None,
    ) -> Optional[dict]:
        """Build a chat payload from a template and user input."""
        template = self._prompt_templates.get(template_id)
        if not template:
            logger.warning("Template %s not found", template_id)
            return None

        if mode:
            special = self._special_modes.get(mode)
            if special:
                system_prompt = special.get("system_prompt", template["system_prompt"])
                temperature = special.get("temperature", template.get("temperature", 0.3))
                max_tokens = special.get("max_tokens", template.get("max_tokens", 1000))
            else:
                system_prompt = template["system_prompt"]
                temperature = template.get("temperature", 0.3)
                max_tokens = template.get("max_tokens", 1000)
        else:
            system_prompt = template["system_prompt"]
            temperature = template.get("temperature", 0.3)
            max_tokens = template.get("max_tokens", 1000)

        user_prompt = template["user_prompt_template"]
        if variables:
            try:
                user_prompt = user_prompt.format(**variables)
            except KeyError as e:
                logger.warning("Missing variable %s in template %s", e, template_id)

        user_prompt = user_prompt.replace("{user_input}", user_input)

        return {
            "system_prompt": system_prompt,
            "user_prompt": user_prompt,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "mode_tags": template.get("mode_tags", []),
        }

    def build_emergency_payload(self, user_input: str, disaster_type: str = "", location: str = "") -> Optional[dict]:
        """Build an emergency mode chat payload."""
        emergency = self._special_modes.get("emergency")
        if not emergency:
            return self.build_chat_payload("disaster-action", user_input, {
                "disaster_type": disaster_type,
                "location": location,
                "situation": "acil",
            })

        user_prompt = f"Acil durum: {disaster_type}\nKonum: {location}\n\n{user_input}"

        return {
            "system_prompt": emergency["system_prompt"],
            "user_prompt": user_prompt,
            "temperature": emergency.get("temperature", 0.1),
            "max_tokens": emergency.get("max_tokens", 300),
            "mode_tags": emergency.get("mode_tags", ["emergency"]),
        }

    def build_child_safe_payload(self, user_input: str, topic: str = "") -> Optional[dict]:
        """Build a child-safe mode chat payload."""
        child_safe = self._special_modes.get("child_safe")
        if not child_safe:
            return self.build_chat_payload("explain-for-kids", user_input, {"topic": topic})

        user_prompt = f"Konu: {topic}\n\n{user_input}"

        return {
            "system_prompt": child_safe["system_prompt"],
            "user_prompt": user_prompt,
            "temperature": child_safe.get("temperature", 0.7),
            "max_tokens": child_safe.get("max_tokens", 400),
            "mode_tags": child_safe.get("mode_tags", ["child-safe"]),
        }

    def build_vault_payload(self, user_input: str) -> Optional[dict]:
        """Build a private vault mode chat payload."""
        vault = self._special_modes.get("private_vault")
        if not vault:
            return None

        return {
            "system_prompt": vault["system_prompt"],
            "user_prompt": user_input,
            "temperature": vault.get("temperature", 0.1),
            "max_tokens": vault.get("max_tokens", 200),
            "mode_tags": vault.get("mode_tags", ["vault", "privacy"]),
        }

    def get_default_system_prompt(self) -> str:
        """Get the default system prompt."""
        return self._system_defaults.get(
            "default_system_prompt",
            "Sen prepturk asistanisin. Turkiye'de afet hazirligi konusunda vatandaslara yardimci olursun. "
            "Kisa ve net cevaplar ver. Kaynak belirt. Asla uydurma. Turkce cevap ver.",
        )
