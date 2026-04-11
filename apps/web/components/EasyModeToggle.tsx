'use client';

import { useEasyModeStore } from '../lib/stores';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/Button';

export default function EasyModeToggle() {
  const { isEasyMode, toggleEasyMode } = useEasyModeStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleEasyMode}
      className="h-9 w-9"
      title={isEasyMode ? 'Kolay Modu kapat' : 'Kolay Modu ac (Easy Mode)'}
    >
      {isEasyMode ? (
        <EyeOff className="h-4 w-4 text-nomad-green" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </Button>
  );
}
