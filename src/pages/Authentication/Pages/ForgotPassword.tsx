import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Logo from '../../../images/logo-sanoh.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface ForgotPasswordState {
    step: 'email' | 'otp' | 'password';
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [state, setState] = useState<ForgotPasswordState>({
        step: 'email',
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Dummy data for testing
    const dummyUsers = [
        'admin@sanoh.com',
        'user@sanoh.com',
        'supplier@sanoh.com'
    ];

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call delay
        setTimeout(() => {
        if (dummyUsers.includes(state.email)) {
            toast.success('OTP code has been sent to your email!');
            setState(prev => ({ ...prev, step: 'otp' }));
        } else {
            toast.error('Email not found in the system!');
        }
        setIsLoading(false);
        }, 1500);
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call delay
        setTimeout(() => {
        // Dummy OTP verification (accept any 6 digit number)
        if (state.otp.length === 6 && /^\d+$/.test(state.otp)) {
            toast.success('OTP code successfully verified!');
            setState(prev => ({ ...prev, step: 'password' }));
        } else {
            toast.error('Invalid OTP code! Please enter 6 digits.');
        }
        setIsLoading(false);
        }, 1500);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (state.newPassword !== state.confirmPassword) {
        toast.error('Password and confirm password do not match!');
        setIsLoading(false);
        return;
        }

        if (state.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters!');
        setIsLoading(false);
        return;
        }

        // Simulate API call delay
        setTimeout(() => {
        // Dummy API call to reset password
        console.log('Reset password API call:', {
            email: state.email,
            otp: state.otp,
            newPassword: state.newPassword
        });

        toast.success('Password successfully changed! Please login with your new password.');
        setIsLoading(false);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            navigate('/auth/login');
        }, 2000);
        }, 1500);
    };

    const handleOTPChange = (value: string) => {
        // Only allow numeric input and max 6 digits
        if (/^\d*$/.test(value) && value.length <= 6) {
        setState(prev => ({ ...prev, otp: value }));
        }
    };

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="min-h-screen bg-white flex items-center justify-center p-5">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <img
                            src={Logo}
                            alt="PT SANOH Indonesia company logo"
                            className="mx-auto mb-6 w-[120px]"
                        />
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">
                            {state.step === 'email' && 'Forgot Password'}
                            {state.step === 'otp' && 'OTP Verification'}
                            {state.step === 'password' && 'Reset Password'}
                        </h1>
                        <p className="text-slate-600 text-sm">
                            {state.step === 'email' && 'Enter your email to receive OTP code'}
                            {state.step === 'otp' && 'Enter the OTP code sent to your email'}
                            {state.step === 'password' && 'Enter your new password'}
                        </p>
                    </div>

                    {/* Step 1: Email Input */}
                    {state.step === 'email' && (
                        <form onSubmit={handleSendCode} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-800 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={state.email}
                                    onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3.5 bg-white rounded-lg border border-indigo-600 border-opacity-40 min-h-[48px] text-base text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full px-5 py-3 text-base text-white rounded-lg bg-blue-900 min-h-[48px] hover:bg-blue-950 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Sending...' : 'Send Code'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Input */}
                    {state.step === 'otp' && (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-slate-800 mb-2">
                                    OTP Code
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={state.otp}
                                    onChange={(e) => handleOTPChange(e.target.value)}
                                    placeholder="Enter 6-digit OTP code"
                                    className="w-full px-4 py-3.5 bg-white rounded-lg border border-indigo-600 border-opacity-40 min-h-[48px] text-base text-black text-center tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    maxLength={6}
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    OTP code sent to: {state.email}
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || state.otp.length !== 6}
                                className="w-full px-5 py-3 text-base text-white rounded-lg bg-blue-900 min-h-[48px] hover:bg-blue-950 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password Input */}
                    {state.step === 'password' && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-800 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        id="newPassword"
                                        value={state.newPassword}
                                        onChange={(e) => setState(prev => ({ ...prev, newPassword: e.target.value }))}
                                        placeholder="Enter new password"
                                        className="w-full px-4 py-3.5 bg-white rounded-lg border border-indigo-600 border-opacity-40 min-h-[48px] text-base text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-800 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={state.confirmPassword}
                                    onChange={(e) => setState(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    placeholder="Confirm new password"
                                    className="w-full px-4 py-3.5 bg-white rounded-lg border border-indigo-600 border-opacity-40 min-h-[48px] text-base text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full px-5 py-3 text-base text-white rounded-lg bg-blue-900 min-h-[48px] hover:bg-blue-950 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </form>
                    )}

                    {/* Back to Login Link */}
                    <div className="text-center mt-6">
                        <button
                        type="button"
                        onClick={() => navigate('/auth/login')}
                        className="text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        >
                        Back to Login
                        </button>
                    </div>

                    {/* Demo Instructions */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-800 mb-2">Demo Instructions:</h3>
                        <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Valid emails: admin@sanoh.com, user@sanoh.com, supplier@sanoh.com</li>
                        <li>• OTP: Enter any 6 digits (example: 123456)</li>
                        <li>• New password: Minimum 6 characters</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;
