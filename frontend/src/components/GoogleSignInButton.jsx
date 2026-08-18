import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../lib/api';
import { GoogleLogin } from '@react-oauth/google';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton() {
  const { t } = useTranslation();
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success(t('common.success') || 'Logged in with Google');
      navigate('/');
    } catch (e) {
      toast.error(apiError(e, 'Google sign-in failed'));
    }
  };

  const handleError = () => {
    toast.error('Google Sign In failed');
  };

  if (!CLIENT_ID) {
    return (
      <button type="button" disabled className="btn-outline w-full py-3 text-sm opacity-60" title="Set VITE_GOOGLE_CLIENT_ID to enable">
        {t('auth.continueWithGoogle')}
      </button>
    );
  }

  return (
    <div className="flex w-full justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="outline"
        size="large"
        shape="pill"
        width="360"
        text="continue_with"
      />
    </div>
  );
}
