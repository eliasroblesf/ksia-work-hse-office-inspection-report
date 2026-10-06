/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Do not show button if already installed
  if (isInstalled) return null;

  // Show standard install prompt when browser supports it
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition active:scale-95"
      >
        <Download className="w-4 h-4" />
        Install App for Offline Use
      </button>
    );
  }

  // iOS button intentionally eliminated as requested
  return null;
};
