type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export interface SampleFormState {
  email: string
  status: SubmitState
  error?: string
}

export function nextSubmitState(state: SampleFormState, serverError?: string): SampleFormState {
  if (serverError) {
    return {
      ...state,
      status: 'error',
      error: serverError,
    }
  }

  return {
    ...state,
    status: 'success',
    error: undefined,
  }
}
