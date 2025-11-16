import { useState, useEffect } from "react";
import "../../../styles/global.styles.css";
import "./Bookings.css";
import { useDispatch, useSelector } from "react-redux";
import { getOrganizer } from "../../../redux/slices/organizer.slice";
import InputField from "../../../utilities/InputField/InputField.utility";
import Loader from "../../../utilities/Loader/Loader.utility";
import Modal from "../../../utilities/Modal/Modal.utlity";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { updateBookingStatus } from "../../../../../eventify-super-admin/src/redux/slices/ticket-booking.slice";

const Bookings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authUser = useSelector((state) => state.auth.user);
  const { organizer, loading: organizerLoading } = useSelector(
    (state) => state.organizer
  );

  console.log("USERR", organizer);

  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    if (authUser?._id) {
      dispatch(getOrganizer(authUser._id));
    }
  }, [dispatch, authUser]);

  const handleSearch = (e) => setSearch(e.target.value);

  const handleViewDetail = (b) => {
    navigate(`/organizer/bookings/manage-bookings/booking-details/${b._id}`, {
      state: { booking: b },
    });
  };

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

  const bookings = organizer?.bookedEvents || [];

  const filteredBookings = bookings.filter(
    (b) =>
      (b.eventId?.title &&
        b.eventId.title.toLowerCase().includes(search.toLowerCase())) ||
      (b.bookedBy?.user?.userName &&
        b.bookedBy.user.userName.toLowerCase().includes(search.toLowerCase()))
  );

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
          {organizerLoading ? (
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
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      #{b.eventId?.bookedBy?.user?._id?.slice(-6) || "N/A"}
                    </td>
                    <td>{b.eventId?.bookedBy?.user?.userName || "N/A"}</td>
                    <td>{b.eventId?.title || "N/A"}</td>
                    <td>
                      {b.eventId?.ticketConfig?.ticketTypes
                        ?.map((t) => t.name)
                        .join(", ") || "N/A"}
                    </td>
                    <td>{b.status || "N/A"}</td>
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
          buttons={getNextBookingStatuses(selectedBooking?.status).map(
            (status) => ({
              label: status,
              onClick: () => changeBookingStatus(status),
              loading: loadingAction === status,
              className: "modal-btn booking-btn",
            })
          )}
        >
          <p>Current Status: {selectedBooking?.status || "N/A"}</p>
          <p>Choose new status:</p>
        </Modal>
      </div>
    </section>
  );
};

export default Bookings;
