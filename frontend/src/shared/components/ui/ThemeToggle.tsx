"use client";

import React from 'react';
import styled from 'styled-components';
import { useTheme } from '@/core/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <StyledWrapper>
      <label className="switch" aria-label={isDark ? 'Modo claro' : 'Modo escuro'}>
        <input
          className="input"
          type="checkbox"
          role="switch"
          aria-checked={isDark}
          checked={isDark}
          onChange={toggleTheme}
        />
        <span className="slider" />
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* Pequeno de propósito */
  .switch {
    /* Usa tokens da brand com fallback */
    --secondary-container: var(--bg-secondary, #415863);
    --primary: var(--color-primary, #67c0ec);
    font-size: 13px;
    position: relative;
    display: inline-block;
    width: 3.7em;
    height: 1.8em;
  }

  .switch .input {
    display: none;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-primary, #071019);
    transition: 0.2s ease;
    border-radius: 30px;
    border: 1px solid var(--color-border, rgba(255,255,255,0.08));
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 1.4em;
    width: 1.4em;
    border-radius: 20px;
    left: 0.2em;
    bottom: 0.2em;
    background-color: var(--color-text-light, #a09e9e);
    transition: 0.2s ease;
  }

  .input:checked + .slider::before {
    background-color: var(--primary);
  }

  .input:checked + .slider {
    background-color: var(--secondary-container);
  }

  .input:focus + .slider {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .input:checked + .slider:before {
    transform: translateX(1.9em);
  }
`;
