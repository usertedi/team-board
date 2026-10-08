import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sun,
  Moon,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TeamBoardsWordmark } from './BrandAndPrimitives';

interface AuthScreenProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  theme,
  onToggleTheme,
}) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    continueWithDemoProfile,
    authError,
    clearAuthError,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Project Lead');
  const [submitting, setSubmitting] = useState(false);
  const [resetSentMessage, setResetSentMessage] = useState<string | null>(null);
  const [localValidationError, setLocalValidationError] = useState<
    string | null
  >(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalValidationError(null);
    setResetSentMessage(null);
    clearAuthError();

    if (!email.trim() || !email.includes('@')) {
      setLocalValidationError('Please enter a valid email address.');
      return;
    }

    if (mode === 'reset') {
      setSubmitting(true);
      try {
        await resetPassword(email);
        setResetSentMessage(
          `If an account exists for ${email.trim()}, a password reset link has been sent to your inbox.`
        );
      } catch {
        // Handled by AuthContext
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (password.length < 6) {
      setLocalValidationError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'signup' && !displayName.trim()) {
      setLocalValidationError('Please enter your display name.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName, roleTitle);
      }
    } catch {
      // Handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalValidationError(null);
    clearAuthError();
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch {
      // Handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const errorMessage = localValidationError || authError;

  return (
    <div className="h-dvh w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col justify-between px-4 py-5 sm:p-6 overflow-y-auto">
      {/* Top Bar: Clean Wordmark + Theme Toggle */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between shrink-0">
        <TeamBoardsWordmark size="md" />

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={
            theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
          }
          className="h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-2 text-[13px] font-medium transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-[#E5A83B]" />
              <span>Light theme</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Dark theme</span>
            </>
          )}
        </button>
      </header>

      {/* Center Auth Card */}
      <main className="w-full max-w-[420px] mx-auto my-4 sm:my-6 shrink-0">
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 sm:p-6 shadow-sm space-y-5">
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-[20px] leading-[28px] font-semibold tracking-tight text-[var(--text-primary)]">
              {mode === 'login'
                ? 'Sign in to Team Boards'
                : mode === 'signup'
                ? 'Create your Team Boards account'
                : 'Reset your password'}
            </h1>
            <p className="text-[14px] leading-[20px] text-[var(--text-muted)]">
              {mode === 'login'
                ? 'Enter your credentials or continue with your workspace provider.'
                : mode === 'signup'
                ? 'Set up your profile to collaborate on team boards and issues.'
                : 'Enter the email address associated with your account and we will send you a password reset link.'}
            </p>
          </div>

          {/* Success Banner (Password Reset Sent) */}
          {resetSentMessage && (
            <div
              role="status"
              className="p-3 rounded-[var(--radius-sm)] bg-[var(--status-done)]/10 border border-[var(--status-done)]/30 text-[var(--status-done)] text-[13px] flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{resetSentMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-[var(--radius-sm)] bg-[#EB5757]/10 border border-[#EB5757]/30 text-[#EB5757] text-[13px] flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* OAuth Provider Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              disabled={submitting}
              onClick={handleGoogleSignIn}
              className="w-full h-10 px-4 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-primary)] text-[14px] font-medium flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.9C3.5 21.4 7.4 24 12 24z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Disabled GitHub Provider Button with "Coming soon" tooltip per instructions */}
            <div className="relative group">
              <button
                type="button"
                disabled
                aria-disabled="true"
                title="Coming soon"
                className="w-full h-10 px-4 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)]/50 border border-[var(--border-subtle)] text-[var(--text-muted)] text-[14px] font-medium flex items-center justify-between cursor-not-allowed opacity-70"
              >
                <span className="flex items-center gap-2.5">
                  <svg
                    className="w-4 h-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>Continue with GitHub</span>
                </span>
                <span className="text-[12px] px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-3)] text-[var(--text-secondary)]">
                  Coming soon
                </span>
              </button>
              <div
                role="tooltip"
                className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--bg-surface-3)] border border-[var(--border-strong)] text-[12px] text-[var(--text-primary)] whitespace-nowrap shadow-md"
              >
                Coming soon — provider keys not yet configured
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-[var(--border-subtle)]" />
            <span className="px-3 bg-[var(--bg-surface-1)] text-[12px] text-[var(--text-muted)] uppercase tracking-wider">
              or with email
            </span>
            <div className="w-full border-t border-[var(--border-subtle)]" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <label
                    htmlFor="auth-name"
                    className="block text-[12px] font-medium text-[var(--text-secondary)]"
                  >
                    Display Name
                  </label>
                  <div className="relative flex items-center">
                    <UserIcon className="w-4 h-4 text-[var(--text-muted)] absolute left-3 pointer-events-none" />
                    <input
                      id="auth-name"
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Elena Rostova"
                      className="w-full h-10 pl-9 pr-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-[var(--radius-sm)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="auth-role"
                    className="block text-[12px] font-medium text-[var(--text-secondary)]"
                  >
                    Role / Team Title
                  </label>
                  <div className="relative flex items-center">
                    <Briefcase className="w-4 h-4 text-[var(--text-muted)] absolute left-3 pointer-events-none" />
                    <input
                      id="auth-role"
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="e.g. Creative Producer, Operations Lead, Founder"
                      className="w-full h-10 pl-9 pr-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-[var(--radius-sm)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="auth-email"
                className="block text-[12px] font-medium text-[var(--text-secondary)]"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3 pointer-events-none" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-10 pl-9 pr-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-[var(--radius-sm)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="auth-password"
                    className="block text-[12px] font-medium text-[var(--text-secondary)]"
                  >
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setLocalValidationError(null);
                        setResetSentMessage(null);
                        clearAuthError();
                      }}
                      className="text-[12px] font-medium text-[var(--accent-primary)] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3 pointer-events-none" />
                  <input
                    id="auth-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-9 pr-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-[var(--radius-sm)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 px-4 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[14px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>
                {mode === 'login'
                  ? 'Sign In'
                  : mode === 'signup'
                  ? 'Create Account'
                  : 'Send Password Reset Link'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Switch Mode + Quick Demo Workspace Access */}
          <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-3 text-[13px]">
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span>
                {mode === 'login'
                  ? "Don't have an account?"
                  : mode === 'signup'
                  ? 'Already have an account?'
                  : 'Remembered your password?'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setLocalValidationError(null);
                  setResetSentMessage(null);
                  clearAuthError();
                }}
                className="font-medium text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                {mode === 'login' ? 'Create account' : 'Back to Sign in'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => continueWithDemoProfile()}
              className="w-full h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--accent-tint)] hover:opacity-90 text-[var(--accent-primary)] text-[13px] font-medium flex items-center justify-center gap-1.5 transition-opacity cursor-pointer"
            >
              <span>Explore Demo Workspace as Elena Rostova</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      {/* Quiet Footer (No fake telemetry or invented badges) */}
      <footer className="w-full max-w-6xl mx-auto pt-2 pb-1 flex items-center justify-between text-[12px] text-[var(--text-muted)] shrink-0">
        <span>Team Boards</span>
        <span>Keyboard-first project & issue tracking</span>
      </footer>
    </div>
  );
};
