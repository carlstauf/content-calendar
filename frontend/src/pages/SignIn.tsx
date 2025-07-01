import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/stores/auth'
import { CalendarIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface SignInForm {
  name: string
}

export default function SignIn() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>()

  const onSubmit = async (data: SignInForm) => {
    try {
      setIsLoading(true)
      await login(data.name)
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <CalendarIcon className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome to Content Calendar
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your name to get started
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="name" className="label">
              Your name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your name"
              className="input mt-1"
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 1,
                  message: 'Name must be at least 1 character',
                },
              })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary btn-lg"
          >
            {isLoading ? 'Logging in...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}