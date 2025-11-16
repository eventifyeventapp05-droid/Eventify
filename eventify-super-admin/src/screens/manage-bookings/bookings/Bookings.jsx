import { useState, useEffect } from "react";
import "../../../styles/global.styles.css";
import "./Bookings.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllBookings,
  updateBookingStatus,
} from "../../../redux/slices/ticket-booking.slice";
import InputField from "../../../utilities/InputField/InputField.utility";
import Loader from "../../../utilities/Loader/Loader.utility";
import Modal from "../../../utilities/Modal/Modal.utlity";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Bookings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bookings = useSelector((state) => state.bookings.bookings);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    setLoading(true);
    dispatch(getAllBookings())
      .unwrap()
      .finally(() => setLoading(false));
  }, [dispatch]);

  const filteredBookings = (Array.isArray(bookings) ? bookings : []).filter(
    (b) =>
      (b.user?.userName &&
        b.user.userName.toLowerCase().includes(search.toLowerCase())) ||
      (b.event?.title &&
        b.event.title.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSearch = (e) => setSearch(e.target.value);

  const handleViewDetails = (b) =>
    navigate(`/super-admin/bookings/${b._id}`, { state: { booking: b } });

  /** Booking Status Helpers */
  const getNextBookingStatuses = (current) => {
    switch (current) {
      case "PENDING":
        return ["CONFIRMED", "CANCELLED", "REFUNDED"];
      case "CONFIRMED":
        return ["CANCELLED", "REFUNDED"];
      case "CANCELLED":
        return ["REFUNDED"];
      default:
        return [];
    }
  };

  const changeBookingStatus = async (status, reason = "", notes = "") => {
    setLoadingAction(status);
    try {
      if (selectedBooking?._id) {
        await dispatch(
          updateBookingStatus({
            bookingId: selectedBooking._id,
            type: "booking",
            bookingStatus: status,
            reason,
            notes,
          })
        ).unwrap();

        toast.success(`Booking status updated to ${status}`);
        dispatch({
          type: "bookings/setBookings",
          payload: bookings.map((b) =>
            b._id === selectedBooking._id ? { ...b, bookingStatus: status } : b
          ),
        });
      }
    } catch {
      toast.error("Failed to update booking status");
    } finally {
      setLoadingAction(null);
      setBookingModalOpen(false);
      setSelectedBooking(null);
    }
  };

  /** Payment Status Helpers */
  const getNextPaymentStatuses = (current) => {
    switch (current) {
      case "PENDING":
        return ["PAID", "FAILED"];
      default:
        return [];
    }
  };

  const changePaymentStatus = async (status) => {
    setLoadingAction(status);
    try {
      if (selectedBooking?._id) {
        await dispatch(
          updateBookingStatus({
            bookingId: selectedBooking._id,
            type: "payment",
            status,
          })
        ).unwrap();
        toast.success(`Payment status updated to ${status}`);
        dispatch({
          type: "bookings/setBookings",
          payload: bookings.map((b) =>
            b._id === selectedBooking._id ? { ...b, paymentStatus: status } : b
          ),
        });
      }
    } catch {
      toast.error("Failed to update payment status");
    } finally {
      setLoadingAction(null);
      setPaymentModalOpen(false);
      setSelectedBooking(null);
    }
  };

  const handleViewDetail = (b) => {
    navigate(`/super-admin/bookings/manage-bookings/booking-details/${b._id}`, {
      state: { booking: b },
    });
  };

  return (
    <section id="bookings">
      <div className="bookings-container">
        <h2 className="bookings-title">Bookings List</h2>
        <div className="bookings-header">
          <InputField
            type="text"
            placeholder="Search Bookings by User or Event"
            value={search}
            onChange={handleSearch}
            width={300}
          />
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loader-container">
              <Loader />
            </div>
          ) : filteredBookings.length > 0 ? (
            <table className="bookings-table">
              <thead>
                <tr className="table-header-row">
                  <th>BID</th>
                  <th>User Name</th>
                  <th>Event</th>
                  <th>Ticket Type</th>
                  <th>Booking Status</th>
                  <th>Payment Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b._id}>
                    <td>#{b.user?._id ? b.user._id.slice(-6) : "N/A"}</td>
                    <td>{b.user?.userName || "N/A"}</td>
                    <td>{b.event?.title || "N/A"}</td>
                    <td>{b.ticketType || "N/A"}</td>
                    <td>{b.bookingStatus || "N/A"}</td>
                    <td>{b.paymentStatus || "N/A"}</td>
                    <td className="actions">
                      <button
                        className="action-btn view-detail-btn"
                        onClick={() => handleViewDetail(b)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="action-btn status-change-btn"
                        onClick={() => {
                          setSelectedBooking(b);
                          setBookingModalOpen(true);
                        }}
                      >
                        <i className="fas fa-sync-alt"></i>
                      </button>
                      <button
                        className="action-btn payment-change-btn"
                        onClick={() => {
                          setSelectedBooking(b);
                          setPaymentModalOpen(true);
                        }}
                      >
                        <i className="fas fa-credit-card"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-bookings-found">
              <i className="fas fa-ticket-alt"></i>
              <p>No Bookings Found</p>
            </div>
          )}
        </div>

        {/* Booking Status Modal */}
        <Modal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          title="Update Booking Status"
          loading={loadingAction !== null}
          buttons={getNextBookingStatuses(selectedBooking?.bookingStatus).map(
            (status) => ({
              label: status,
              onClick: () => changeBookingStatus(status),
              loading: loadingAction === status,
              className: "modal-btn booking-btn",
            })
          )}
        >
          <p>Current Status: {selectedBooking?.bookingStatus || "N/A"}</p>
          <p>Choose new status:</p>
        </Modal>

        {/* Payment Status Modal */}
        <Modal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          title="Update Payment Status"
          loading={loadingAction !== null}
          buttons={getNextPaymentStatuses(selectedBooking?.paymentStatus).map(
            (status) => ({
              label: status,
              onClick: () => changePaymentStatus(status),
              loading: loadingAction === status,
              className: "modal-btn payment-btn",
            })
          )}
        >
          <p>Current Status: {selectedBooking?.paymentStatus || "N/A"}</p>
          <p>Choose new status:</p>
        </Modal>
      </div>
    </section>
  );
};

export default Bookings;
