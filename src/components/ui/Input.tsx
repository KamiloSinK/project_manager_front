import {forwardRef} from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>((
  { label, error, helperText, className, ...props },
  ref
) => {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          // Base styles
          'w-full px-4 py-3 text-gray-900 bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl',
          'placeholder:text-gray-400 text-base font-medium',
          // Focus styles
          'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white',
          // Hover styles
          'hover:border-gray-300 hover:bg-white',
          // Disabled styles
          'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200',
          // Transitions
          'transition-all duration-200 ease-in-out',
          // Shadow
          'shadow-sm hover:shadow-lg focus:shadow-lg',
          // Error styles
          error && 'border-red-300 focus:ring-red-500/30 focus:border-red-500 bg-red-50/50',
          // Responsive
          'sm:text-sm',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-600">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;