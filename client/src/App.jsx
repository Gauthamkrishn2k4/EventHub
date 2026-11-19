import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import EventEditor from './pages/admin/EventEditor.jsx';
import ManageBookings from './pages/admin/ManageBookings.jsx';
import ManageEvents from './pages/admin/ManageEvents.jsx';
import BookingDetails from './pages/BookingDetails.jsx';
import BookingPage from './pages/BookingPage.jsx';
import EventDetails from './pages/EventDetails.jsx';
import EventList from './pages/EventList.jsx';
import Login from './pages/Login.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Register from './pages/Register.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* public */}
        <Route path="/" element={<EventList />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* customer only */}
        <Route element={<ProtectedRoute roles={['Customer']} />}>
          <Route path="/events/:id/book" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>

        {/* any signed-in user (the API enforces owner/admin) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/bookings/:id" element={<BookingDetails />} />
        </Route>

        {/* admin only */}
        <Route element={<ProtectedRoute roles={['Admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="events" element={<ManageEvents />} />
            <Route path="events/new" element={<EventEditor />} />
            <Route path="events/:id/edit" element={<EventEditor />} />
            <Route path="bookings" element={<ManageBookings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
