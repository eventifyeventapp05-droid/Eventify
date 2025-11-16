import { useState, useEffect } from "react";
import "../../../styles/global.styles.css";
import "./Event.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getEvents,
  setEvents,
  deleteEvent,
} from "../../../redux/slices/event.slice";
import { updateEventStatus } from "../../../redux/slices/super-admin.slice";
import Modal from "../../../utilities/Modal/Modal.utlity";
import { toast } from "react-hot-toast";
import InputField from "../../../utilities/InputField/InputField.utility";
import { useNavigate } from "react-router-dom";
import Loader from "../../../utilities/Loader/Loader.utility";
import Button from "../../../utilities/Button/Button.utility";

const Events = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const events = useSelector((state) => state.events.events);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      dispatch(getEvents())
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dispatch, user?.id]);

  const filteredEvents = (Array.isArray(events) ? events : []).filter(
    (e) =>
      (e.title && e.title.toLowerCase().includes(search.toLowerCase())) ||
      (e.category && e.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSearch = (e) => setSearch(e.target.value);

  const handleDeleteEvent = (e) => {
    setSelectedEvent(e);
    setIsDeleteModalOpen(true);
  };

  const deleteEventHandler = async () => {
    setLoadingAction("DELETE");
    try {
      if (selectedEvent?._id) {
        await dispatch(deleteEvent(selectedEvent._id));
        toast.success("Event deleted successfully!");
        dispatch(
          setEvents(events.filter((doc) => doc._id !== selectedEvent._id))
        );
      }
    } catch {
      toast.error("Error while deleting event.");
    } finally {
      setLoadingAction(null);
      setIsDeleteModalOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleViewDetail = (e) => {
    navigate(`/super-admin/events/manage-events/event-details/${e._id}`, {
      state: { event: e },
    });
  };

  const handleUpdateEvent = (e) => {
    navigate(`/super-admin/events/manage-events/update-event/${e._id}`, {
      state: { event: e },
    });
  };

  const handleCreateEventNavigate = () => {
    navigate("/super-admin/events/manage-events/create-event");
  };

  // Status change
  const handleStatusChange = (event) => {
    setSelectedEvent(event);
    setIsStatusModalOpen(true);
  };

  const getNextValidStatuses = (currentStatus) => {
    switch (currentStatus) {
      case "DRAFT":
        return ["PUBLISHED", "CANCELLED"];
      case "PUBLISHED":
        return ["COMPLETED", "CANCELLED"];
      case "CANCELLED":
      case "COMPLETED":
        return [];
      default:
        return [];
    }
  };

  // Map frontend status to backend action
  const actionMap = {
    PUBLISHED: "PUBLISH",
    CANCELLED: "CANCEL",
    COMPLETED: "COMPLETE",
  };

  const changeEventStatus = async (status) => {
    setLoadingAction(status);
    try {
      if (selectedEvent?._id) {
        const action = actionMap[status];
        await dispatch(
          updateEventStatus({ eventId: selectedEvent._id, action })
        ).unwrap();

        toast.success(`Event status changed to ${status} successfully!`);

        const updatedEvents = events.map((event) =>
          event._id === selectedEvent._id ? { ...event, status } : event
        );
        dispatch(setEvents(updatedEvents));
      }
    } catch (error) {
      toast.error(`Failed to change status: ${error.message}`);
    } finally {
      setLoadingAction(null);
      setIsStatusModalOpen(false);
      setSelectedEvent(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "#FFA500"; // Orange
      case "PUBLISHED":
        return "#4169E1"; // Royal Blue
      case "CANCELLED":
        return "#FF0000"; // Red
      case "COMPLETED":
        return "#4CAF50"; // Green
      default:
        return "#808080";
    }
  };

  return (
    <section id="events">
      <div className="events-container">
        <h2 className="events-title">Events List</h2>
        <div className="events-header">
          <InputField
            type="text"
            placeholder="Search Events"
            value={search}
            onChange={handleSearch}
            width={300}
          />

          <div className="btn-container">
            <Button
              title="Event"
              width={110}
              onPress={handleCreateEventNavigate}
              icon={<i className="fas fa-plus-circle"></i>}
            />
          </div>
        </div>
        <div className="table-responsive">
          {loading ? (
            <div className="loader-container">
              <Loader />
            </div>
          ) : filteredEvents.length > 0 ? (
            <table className="events-table">
              <thead>
                <tr className="table-header-row">
                  <th>EID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((e) => (
                  <tr key={e._id}>
                    <td>#{e._id.substring(18, 24).toUpperCase()}</td>
                    <td>{e.title}</td>
                    <td>{e.category || "N/A"}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(e.status) }}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="action-btn edit-detail-btn"
                        onClick={() => handleUpdateEvent(e)}
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>

                      <button
                        className="action-btn view-detail-btn"
                        onClick={() => handleViewDetail(e)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {getNextValidStatuses(e.status).length > 0 && (
                        <button
                          className="action-btn status-change-btn"
                          onClick={() => handleStatusChange(e)}
                        >
                          <i className="fas fa-sync"></i>
                        </button>
                      )}
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteEvent(e)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-events-found">
              <i className="fas fa-calendar-times"></i>
              <p>No Events Found</p>
            </div>
          )}
        </div>

        {/* Status Change Modal */}
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Update Event Status for "${selectedEvent?.title || ""}"`}
          loading={loadingAction !== null}
          buttons={getNextValidStatuses(selectedEvent?.status).map(
            (status) => ({
              label: status,
              className: `modal-btn-${status.toLowerCase()}`,
              onClick: () => changeEventStatus(status),
              loading: loadingAction === status,
            })
          )}
        >
          <p>Current Status: {selectedEvent?.status}</p>
          <p>Choose a new status:</p>
          <div className="status-options">
            {getNextValidStatuses(selectedEvent?.status).map((status) => (
              <div key={status} className="status-option">
                → {status}
              </div>
            ))}
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title={`Delete Event "${selectedEvent?.title || ""}"`}
          loading={loadingAction === "DELETE"}
          buttons={[
            {
              label: "Delete",
              className: "danger-btn",
              onClick: deleteEventHandler,
              loading: loadingAction === "DELETE",
            },
          ]}
        >
          <p>Are you sure you want to delete this event?</p>
          <p>This action cannot be undone.</p>
        </Modal>
      </div>
    </section>
  );
};

export default Events;
