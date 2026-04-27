import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import './LoginForm.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLoginMutation } from '@/entities/auth';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginRequest, { isLoading, error }] = useLoginMutation();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      const loginResponse = await loginRequest({ email, password }).unwrap();
      navigate(loginResponse.role === "admin" ? "/operator-panel" : "/applications");
    } catch {
      // Error state is handled by RTK Query mutation state
    }
  };

  const errorMessage =
    error && "data" in error && typeof error.data === "object" && error.data && "message" in error.data
      ? String(error.data.message)
      : "Не удалось авторизоваться. Проверьте логин и пароль.";

  return (
    <div className='login-form'>
      <h2 className='login-form__title'>
        Войдите в систему
      </h2>
      <div className='login-form__fields'>
        <Input
          label='Email'
          type='email'
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label='Пароль'
          type='password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <div className='login-form__submit-button'>
        <Button
          variant="primary"
          disabled={isLoading}
          type='button'
          text='Войти'
          onClick={handleLogin}
        />
      </div>
      {error && <p className='login-form__error'>{errorMessage}</p>}
    </div>
  );
};

export default LoginForm;