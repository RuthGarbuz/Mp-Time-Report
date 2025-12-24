export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SecurityState {
  attempts: number;
  isLocked: boolean;
  lockTime: Date | null;
  showCaptcha: boolean;
}

export interface UiState {
  showPassword: boolean;
  isLoading: boolean;
  errors: { [key: string]: string };
  message: string;
  isSuccess: boolean;
}