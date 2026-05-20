import React, { useState } from 'react';
import '../styles/Login.scss';

export default function Login({ onLoginSuccess, systemText }) {
  const [pass, setPass] = useState('');
  if (!systemText) return null;

  const systemSource = systemText.system ? systemText.system : systemText;
  const { login } = systemSource;

  const handleLogin = (e) => {
    e.preventDefault();
    if (pass.toUpperCase() === 'ES') {
      onLoginSuccess();
    } else {
      alert(login.error);
    }
  };

  return (
    <div className="login-screen">
      
      <h1 className="login-screen__title">{login.title}</h1>
      <h5 className="login-screen__subtitle">{login.subtitle}</h5>
      <form className="login-screen__form" onSubmit={handleLogin}>
        <input 
          className="login-screen__input"
          type="password" 
          placeholder={login.placeholder} 
          onChange={(e) => setPass(e.target.value)}
          autoFocus
        />
        
      </form>
    </div>
  );
}
