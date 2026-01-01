import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TruckIcon, MapIcon, UsersIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const LandingPage: React.FC = () => {
    const { user, login, loading } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation(['common']);

    React.useEffect(() => {
        // If user is already logged in, redirect to projects
        if (user && !loading) {
            navigate('/projects');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        RouteScout
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Smart route planning and dispatch management for your delivery operations
                    </p>

                    {!user && (
                        <button
                            onClick={login}
                            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Sign in with Google to Get Started
                        </button>
                    )}
                </div>

                {/* Features Section */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                            <MapIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Smart Route Planning</h3>
                        <p className="text-gray-600">
                            Automatically organize stops into efficient routes based on location and capacity
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                            <TruckIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Trailer Management</h3>
                        <p className="text-gray-600">
                            Manage different trailer sizes and optimize load capacity for each route
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                            <UsersIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Team Coordination</h3>
                        <p className="text-gray-600">
                            Assign routes to teams and track progress in real-time
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                            <CheckCircleIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Live Tracking</h3>
                        <p className="text-gray-600">
                            Monitor deliveries and update stop statuses as work progresses
                        </p>
                    </div>
                </div>

                {/* How It Works Section */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-16">
                    <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                1
                            </div>
                            <h3 className="font-semibold mb-2">Create a Project</h3>
                            <p className="text-gray-600">
                                Set up your delivery project and import stops from addresses
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                2
                            </div>
                            <h3 className="font-semibold mb-2">Plan Routes</h3>
                            <p className="text-gray-600">
                                Drag and drop stops to create routes and assign them to teams
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                3
                            </div>
                            <h3 className="font-semibold mb-2">Execute & Track</h3>
                            <p className="text-gray-600">
                                Teams complete deliveries and update statuses in real-time
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                {!user && (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Ready to optimize your routes?</h2>
                        <p className="text-gray-600 mb-6">Sign in with your Google account to get started</p>
                        <button
                            onClick={login}
                            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Sign in with Google
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-8">
                <div className="container mx-auto px-4 text-center text-gray-600">
                    <p>&copy; {new Date().getFullYear()} RouteScout. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
