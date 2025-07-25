import { useEffect, Suspense, lazy } from 'react';
import LoadingSpinner from './components/common/LoadingSpinner';
import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import { ToastProvider } from './contexts/ToastContext';

const Layout = lazy(() => import('./components/layout/Layout'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const JournalsPage = lazy(() => import('./pages/JournalsPage'));
const ForumPage = lazy(() => import('./pages/ForumPage'));
const ThreadDetailPage = lazy(() => import('./pages/ThreadDetailPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const CreateEventPage = lazy(() => import('./pages/CreateEventPage'));
const VerificationApplicationPage = lazy(() => import('./pages/VerificationApplicationPage'));
const BusinessListingsPage = lazy(() => import('./pages/BusinessListingsPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductsShowcasePage = lazy(() => import('./pages/ProductsShowcasePage'));
const JobsPage = lazy(() => import('./pages/JobsPage'));
const AdminVerificationPage = lazy(() => import('./pages/dashboard/AdminVerificationPage'));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));
const CreateJobPage = lazy(() => import('./pages/CreateJobPage'));
const JobListingsPage = lazy(() => import('./pages/dashboard/JobListingsPage'));
const JobApplicationsPage = lazy(() => import('./pages/dashboard/JobApplicationsPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ProfileUnifiedPage = lazy(() => import('./pages/ProfileUnifiedPage'));
const AdminArticlesPage = lazy(() => import('./pages/dashboard/AdminArticlesPage'));
const SubmissionPage = lazy(() => import('./pages/SubmissionPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const EditArticlePage = lazy(() => import('./pages/EditArticlePage'));
const MyArticlesPage = lazy(() => import('./pages/MyArticlesPage'));
const MyDiscussionsPage = lazy(() => import('./pages/MyDiscussionsPage'));
const SavedItemsPage = lazy(() => import('./pages/SavedItemsPage'));
const DentistsPage = lazy(() => import('./pages/ProfessorsPage'));
const ProfessorDetailPage = lazy(() => import('./pages/ProfessorDetailPage'));
const ProfessorArticlesPage = lazy(() => import('./pages/ProfessorArticlesPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const SellerApplicationPage = lazy(() => import('./pages/SellerApplicationPage'));
const AdminSellerApplications = lazy(() => import('./pages/AdminSellerApplicationsPage'));
const SellerDashboardPage = lazy(() => import('./pages/dashboard/SellerDashboardPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));

function App() {
  useEffect(() => {
    // Initialize animation observers
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach((element) => {
      observer.observe(element);
    });

    // Parallax effect on mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const parallaxElements = document.querySelectorAll('.parallax');
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;

      parallaxElements.forEach((el) => {
        const element = el as HTMLElement;
        const speed = element.getAttribute('data-speed') || '5';
        const x = mouseX * parseInt(speed);
        const y = mouseY * parseInt(speed);
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<LoadingSpinner text="Loading..." />}>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="articles" element={<ArticlesPage />} />
              <Route path="articles/:id" element={<ArticleDetailPage />} />
              <Route path="journals" element={<JournalsPage />} />
              <Route path="forum" element={<ForumPage />} />
              <Route path="forum/thread/:id" element={<ThreadDetailPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="events/:id" element={<EventDetailPage />} />
              <Route path="events/create" element={<PrivateRoute><CreateEventPage /></PrivateRoute>} />
              <Route path="verification/apply" element={<PrivateRoute><VerificationApplicationPage /></PrivateRoute>} />
              <Route path="business-listings" element={<BusinessListingsPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="jobs/:id" element={<JobDetailPage />} />
              <Route path="jobs/create" element={<PrivateRoute><CreateJobPage /></PrivateRoute>} />
              <Route path="dashboard/job-listings" element={<PrivateRoute><JobListingsPage /></PrivateRoute>} />
              <Route path="dashboard/job-applications" element={<PrivateRoute><JobApplicationsPage /></PrivateRoute>} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products1" element={<ProductsShowcasePage />} />
              {/* Added product detail route from old file */}
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="dentists" element={<DentistsPage />} />
              <Route path="professors/:id/articles" element={<ProfessorArticlesPage />} />
              <Route path="dentists/:id" element={<ProfileUnifiedPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="privacy" element={<PrivacyPolicyPage />} />
              <Route path="submit" element={<PrivateRoute><SubmissionPage /></PrivateRoute>} />
              {/* Added dashboard route from old file */}
              <Route path="dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
              {/* Added seller dashboard route from old file */}
              <Route 
                path="/seller/dashboard" 
                element={
                  <PrivateRoute>
                    <SellerDashboardPage />
                  </PrivateRoute>
                } 
              />
              <Route path="profile" element={<PrivateRoute><ProfileUnifiedPage /></PrivateRoute>} />
              <Route path="admin">
                <Route path="articles" element={<AdminRoute><AdminArticlesPage /></AdminRoute>} />
                <Route path="verifications" element={<AdminRoute><AdminVerificationPage /></AdminRoute>} />
                {/* Added admin seller applications route from old file */}
                <Route path="seller-applications" element={
                  <AdminRoute>
                    <AdminSellerApplications />
                  </AdminRoute>
                } />
              </Route>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
              <Route path="edit-article/:id" element={<PrivateRoute><EditArticlePage /></PrivateRoute>} />
              <Route path="my-articles" element={<PrivateRoute><MyArticlesPage /></PrivateRoute>} />
              <Route path="my-discussions" element={<PrivateRoute><MyDiscussionsPage /></PrivateRoute>} />
              <Route path="saved-items" element={<PrivateRoute><SavedItemsPage /></PrivateRoute>} />
              {/* Added cart and wishlist routes from old file */}
              <Route path="cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
              <Route path="wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
              {/* Added seller application route from old file */}
              <Route path="become-seller" element={<SellerApplicationPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </Suspense>
    </>
  );
}

export default App;
