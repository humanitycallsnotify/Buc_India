import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Registration from "./components/Registration.jsx";
import Gallery from "./components/Gallery.jsx";
import Members from "./components/Members.jsx";
import Safety from "./components/Safety.jsx";
import Forum from "./components/Forum.jsx";
import Footer from "./components/Footer.jsx";
import AdminLogin from "./components/AdminLogin/AdminLogin.jsx";
import AdminDashboard from "./components/AdminDashboardNav/AdminDashboardNav.jsx";
import Events from "./components/PublicHome/PublicHome.jsx";
import PublicRegister from "./components/PublicRegister/PublicRegister.jsx";
import AdminProtectedRoute from "./components/AdminProtectedRoute.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HomePage = () => (
  <>
    <Header />
    <Hero />
    <About />
    <Events />
    <Registration />
    <Gallery />
    <Members />
    <Safety />
    <Forum />
    <Footer />
  </>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black">
        <ToastContainer position="top-center" autoClose={3000} theme="dark" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/event-register/:eventId" element={<PublicRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/*" 
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
