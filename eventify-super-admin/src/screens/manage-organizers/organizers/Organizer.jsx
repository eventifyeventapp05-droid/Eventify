import { useState, useEffect } from "react";
import "../../../styles/global.styles.css";
import "./Organizer.css";
import { useDispatch, useSelector } from "react-redux";
import { getOrganizers } from "../../../redux/slices/organizer.slice";
import InputField from "../../../utilities/InputField/InputField.utility";
import { useNavigate } from "react-router-dom";
import Loader from "../../../utilities/Loader/Loader.utility";

const Organizers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const organizers = useSelector((state) => state.organizers.organizers);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      dispatch(getOrganizers())
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dispatch, user?.id]);

  const filteredOrganizers = (
    Array.isArray(organizers) ? organizers : []
  ).filter(
    (org) =>
      (org.userName &&
        org.userName.toLowerCase().includes(search.toLowerCase())) ||
      (org.email && org.email.toLowerCase().includes(search.toLowerCase())) ||
      (org.organizerProfile?.services &&
        org.organizerProfile.services.some((service) =>
          service.toLowerCase().includes(search.toLowerCase())
        ))
  );

  const handleSearch = (e) => setSearch(e.target.value);

  const handleViewDetail = (org) => {
    navigate(
      `/super-admin/organizers/manage-organizers/organizer-details/${org._id}`,
      {
        state: { organizer: org },
      }
    );
  };

  return (
    <section id="organizers">
      <div className="organizers-container">
        <h2 className="organizers-title">Organizers List</h2>

        <div className="organizers-header">
          <div className="mt-4">
            <InputField
              type="text"
              placeholder="Search Organizers"
              value={search}
              onChange={handleSearch}
              width={300}
            />
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loader-container">
              <Loader />
            </div>
          ) : filteredOrganizers.length > 0 ? (
            <table className="organizers-table">
              <thead>
                <tr className="table-header-row">
                  <th>Name</th>
                  <th>Email</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrganizers.map((org) => (
                  <tr key={org._id}>
                    <td className="organizer-info">
                      <div className="organizer-name">
                        {org.userName || "N/A"}
                      </div>
                    </td>
                    <td className="organizer-email">{org.email || "N/A"}</td>

                    <td className="actions">
                      <button
                        className="action-btn view-detail-btn"
                        onClick={() => handleViewDetail(org)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-organizers-found">
              <i className="fas fa-users-slash"></i>
              <p>No Organizers Found</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Organizers;
