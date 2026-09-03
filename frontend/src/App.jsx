import React, { useEffect, useState } from 'react';
import useStore from './store/store';
import LandingPage from './components/landing/LandingPage';
import AuthPage from './components/auth/AuthPage';
import Sidebar from './components/sidebar/Sidebar';
import HomeFeed from './components/feed/HomeFeed';
import RightSidebar from './components/feed/RightSidebar';
import ExploreMap from './components/explore/ExploreMap';
import VenueProfile from './components/venue/VenueProfile';
import MessagesPage from './components/messages/MessagesPage';
import NotificationsPage from './components/notifications/NotificationsPage';
import UserProfile from './components/profile/UserProfile';
import BusinessDashboard from './components/dashboard/BusinessDashboard';
import PostDetailModal from './components/post/PostDetailModal';
import CreatePostModal from './components/post/CreatePostModal';
import ReservationModal from './components/reservation/ReservationModal';

import FloatingAiWidget from './components/common/FloatingAiWidget';

export default function App() {
  const { isAuthenticated, activeTab, fetchInitialData } = useStore();
  // State for unauthenticated flow: 'landing' | 'auth'
  const [unauthView, setUnauthView] = useState('landing');

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // If user is not logged in, control leading landing page -> auth page flow
  if (!isAuthenticated) {
    if (unauthView === 'auth') {
      return <AuthPage onBackToLanding={() => setUnauthView('landing')} />;
    }
    return (
      <div className="relative">
        <LandingPage
          onOpenAuth={(isSignUp = false) => {
            setUnauthView('auth');
          }}
        />
        <FloatingAiWidget />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex text-zinc-900 font-['Plus_Jakarta_Sans',sans-serif] relative">
      {/* 1. Left Navigation Sidebar */}
      <Sidebar />

      {/* 2. Main Content Routing Area */}
      <main className="flex-1 min-h-screen overflow-y-auto flex justify-center">
        {activeTab === 'home' && (
          <div className="flex-1 flex justify-center">
            <HomeFeed />
            <RightSidebar />
          </div>
        )}

        {(activeTab === 'explore' || activeTab === 'search') && (
          <div className="flex-1">
            <ExploreMap />
          </div>
        )}

        {activeTab === 'venue_profile' && (
          <div className="flex-1">
            <VenueProfile />
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="flex-1 h-screen">
            <MessagesPage />
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="flex-1">
            <NotificationsPage />
          </div>
        )}

        {(activeTab === 'profile' || activeTab === 'saved') && (
          <div className="flex-1">
            <UserProfile />
          </div>
        )}

        {activeTab === 'owner_dashboard' && (
          <div className="flex-1">
            <BusinessDashboard />
          </div>
        )}
      </main>

      {/* 3. Global Floating AI Assistant & Deal Radar Widget */}
      <FloatingAiWidget />

      {/* 4. Global Interactive Modals */}
      <PostDetailModal />
      <CreatePostModal />
      <ReservationModal />
    </div>
  );
}
