import { useState, useEffect,useRef } from "react";
import { plotAPI } from "../services/api";

const LandownerPlots = () => {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [editingPlotId, setEditingPlotId] = useState(null);

  const imageInputRef = useRef(null);
const documentInputRef = useRef(null);
const reuploadInputRef = useRef(null);


  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    size: "",
    unit: "sqft",
    soilType: "loamy",
    waterAvailability: "available",
    pricePerMonth: 0,
    images: [],
    documents: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [documentPreviews, setDocumentPreviews] = useState([]);
  const [reuploadDocuments, setReuploadDocuments] = useState([]);
  const [reuploadPreviews, setReuploadPreviews] = useState([]);

  useEffect(() => {
    fetchPlots();
  }, []);

  const fetchPlots = async () => {
    try {
      const res = await plotAPI.getMyPlots();
      setPlots(res.data.plots);
    } catch (err) {
      console.error("Failed to fetch plots:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      size: "",
      unit: "sqft",
      soilType: "loamy",
      waterAvailability: "available",
      pricePerMonth: 0,
      images: [],
      documents: [],
    });
    setImagePreviews([]);
    setDocumentPreviews([]);
    setReuploadDocuments([]);
    setReuploadPreviews([]);
  };

  const handleAddNewClick = () => {
    setEditingPlotId(null);
    resetForm();
    setShowForm(true);
  };

  const cancelEditing = () => {
    setEditingPlotId(null);
    setShowForm(false);
    resetForm();
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Generate preview for selected images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, documents: [...prev.documents, ...files] }));

    const newPreviews = files.map((file) => file.name);
    setDocumentPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleReuploadDocumentsChange = (e) => {
    const files = Array.from(e.target.files);
    setReuploadDocuments(files);
    const previews = files.map((file) => file.name);
    setReuploadPreviews(previews);
  };

  const removePreview = (index, type) => {
  if (type === "image") {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);

    // If no images left → reset input
    if (newImages.length === 0 && imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  } else if (type === "document") {
    const newDocs = formData.documents.filter((_, i) => i !== index);
    const newDocPreviews = documentPreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, documents: newDocs });
    setDocumentPreviews(newDocPreviews);

    // If no docs left → reset input
    if (newDocs.length === 0 && documentInputRef.current) {
      documentInputRef.current.value = "";
    }
  }
};


  const startEditingPlot = (plot) => {
    setEditingPlotId(plot._id);
    setShowForm(true);
    setFormData({
      title: plot.title || "",
      description: plot.description || "",
      address: plot.location?.address || "",
      city: plot.location?.city || "",
      state: plot.location?.state || "",
      pincode: plot.location?.pincode || "",
      size: plot.size?.value || "",
      unit: plot.size?.unit || "sqft",
      soilType: plot.soilType || "loamy",
      waterAvailability: plot.waterAvailability || "available",
      images: [],
      documents: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const plotData = {
        title: formData.title,
        description: formData.description,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        size: { value: Number(formData.size), unit: formData.unit },
        soilType: formData.soilType,
        waterAvailability: formData.waterAvailability,
      };

      if (editingPlotId) {
        await plotAPI.update(editingPlotId, plotData);
        alert("Plot updated successfully");

        if (reuploadDocuments.length > 0) {
          const docForm = new FormData();
          reuploadDocuments.forEach((d) => docForm.append("documents", d));
          await plotAPI.uploadDocuments(editingPlotId, docForm);
          alert("Verification documents reuploaded!");
        }
      } else {
        const data = new FormData();
        data.append("plotData", JSON.stringify(plotData));
        formData.images.forEach((img) => data.append("images", img));

        const res = await plotAPI.create(data);
        const newPlot = res.data.plot;

        if (formData.documents.length > 0) {
          const docData = new FormData();
          formData.documents.forEach((doc) => docData.append("documents", doc));
          await plotAPI.uploadDocuments(newPlot._id, docData);
        }
        alert("Plot created successfully");
      }

      cancelEditing();
      fetchPlots();
    } catch (error) {
      console.error(error);
      alert("Failed to submit plot");
    }
  };

  const handleView = async (id) => {
    try {
      const res = await plotAPI.getById(id);
      setSelectedPlot(res.data.plot);
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => setSelectedPlot(null);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this plot?")) {
      try {
        await plotAPI.delete(id);
        fetchPlots();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    return (
      <span className={px-3 py-1 text-xs font-medium rounded-full ${colors[status] || "bg-gray-100 text-gray-700"}}>
        {label}
      </span>
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-12 w-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Plots</h1>
          <button
            onClick={() => (showForm && !editingPlotId ? cancelEditing() : handleAddNewClick())}
            className={px-6 py-3 rounded-md font-medium shadow-md ${showForm && !editingPlotId ? "bg-red-600" : "bg-green-600"} text-white}
          >
            {showForm && !editingPlotId ? "Cancel" : "Add New Plot"}
          </button>
        </div>

        {/* FORM - ADD or EDIT */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">{editingPlotId ? "Edit Plot Details" : "Add New Plot"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-medium">Plot Title</label>
                <input name="title" value={formData.title} onChange={handleChange} required className="border p-2 w-full rounded" />
              </div>
              <div>
                <label className="font-medium">Description</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleChange} required className="border p-2 w-full rounded" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium">Address</label>
                  <input name="address" value={formData.address} onChange={handleChange} className="border p-2 w-full rounded" />
                </div>
                <div>
                  <label className="font-medium">City</label>
                  <input name="city" value={formData.city} onChange={handleChange} className="border p-2 w-full rounded" />
                </div>
                <div>
                  <label className="font-medium">State</label>
                  <input name="state" value={formData.state} onChange={handleChange} className="border p-2 w-full rounded" />
                </div>
                <div>
                  <label className="font-medium">Pincode</label>
                  <input name="pincode" value={formData.pincode} onChange={handleChange} className="border p-2 w-full rounded" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium">Plot Size</label>
                  <input name="size" type="number" value={formData.size} onChange={handleChange} className="border p-2 w-full rounded" />
                </div>
                <div>
                  <label className="font-medium">Unit</label>
                  <select name="unit" value={formData.unit} onChange={handleChange} className="border p-2 w-full rounded">
                    <option value="sqft">sqft</option>
                    <option value="sqm">sqm</option>
                    <option value="acres">acres</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="font-medium">Soil Type</label>
                  <select name="soilType" value={formData.soilType} onChange={handleChange} className="border p-2 w-full rounded">
                    <option value="clay">Clay</option>
                    <option value="sandy">Sandy</option>
                    <option value="loamy">Loamy</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium">Water Availability</label>
                  <select name="waterAvailability" value={formData.waterAvailability} onChange={handleChange} className="border p-2 w-full rounded">
                    <option value="available">Available</option>
                    <option value="limited">Limited</option>
                    <option value="not-available">Not Available</option>
                  </select>
                </div>

              </div>

              {!editingPlotId && (
                <>
                  <label className="font-medium">Upload Plot Images</label>
                  <input type="file" multiple onChange={handleImageChange} ref={imageInputRef} />
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt="preview" className="w-28 h-28 rounded object-cover" />
                        <button type="button" onClick={() => removePreview(i, "image")} className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-2">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <label className="font-medium mt-3">{editingPlotId ? "Reupload Verification Documents" : "Upload Verification Documents"}</label>
              <input type="file" multiple onChange={editingPlotId ? handleReuploadDocumentsChange : handleDocumentChange} ref={editingPlotId ? reuploadInputRef : documentInputRef} />
              <ul className="mt-2 text-sm text-gray-700">
                {(editingPlotId ? reuploadPreviews : documentPreviews).map((file, i) => (
                  <li key={i} className="flex justify-between border-b py-1">
                    <span>{file}</span>
                    {!editingPlotId && (
                      <button onClick={() => removePreview(i, "document")} className="text-red-600 hover:underline">
                        remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded mt-5">
                {editingPlotId ? "Update Plot" : "Create Plot"}
              </button>
            </form>
          </div>
        )}

        {/* PLOTS LIST */}
        {!showForm && (
          <div className="grid md:grid-cols-3 gap-4">
            {plots.map((plot) => (
              <div key={plot._id} className="bg-white shadow rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold truncate">{plot.title}</h3>
                  {getStatusBadge(plot.verificationStatus || "pending")}
                </div>
                <p className="text-gray-700 text-sm mb-2">{plot.description}</p>
                <p className="text-gray-500 text-sm">
                  {plot.location.city}, {plot.location.state}
                </p>
                <p className="text-sm mt-1">{plot.size.value} {plot.size.unit} | {plot.soilType}</p>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleView(plot._id)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 rounded">
                    View
                  </button>
                  <button onClick={() => startEditingPlot(plot)} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-sm text-white py-1 rounded">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(plot._id)} className="flex-1 bg-red-500 hover:bg-red-600 text-sm text-white py-1 rounded">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW MODAL */}
        {selectedPlot && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 relative w-11/12 md:w-2/3 max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute right-4 top-3 text-gray-500 hover:text-black text-2xl font-bold"
              >
                ×
              </button>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-1 text-gray-800">{selectedPlot.title}</h2>
              {getStatusBadge(selectedPlot.verificationStatus)}
              <p className="mt-2 text-gray-600 leading-relaxed">{selectedPlot.description}</p>

              {/* Details Section */}
              <div className="grid md:grid-cols-2 gap-3 mt-4 text-sm text-gray-700">
                <p>
                  <strong>City:</strong> {selectedPlot.location.city}
                </p>
                <p>
                  <strong>State:</strong> {selectedPlot.location.state}
                </p>
                <p>
                  <strong>Size:</strong> {selectedPlot.size.value} {selectedPlot.size.unit}
                </p>
                <p>
                  <strong>Soil Type:</strong> {selectedPlot.soilType}
                </p>
                <p>
                  <strong>Water Availability:</strong> {selectedPlot.waterAvailability}
                </p>
              </div>

              {/* Images */}
              {selectedPlot.images.length > 0 && (
                <>
                  <h3 className="font-semibold mt-5 mb-2 text-gray-800">Plot Images</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {selectedPlot.images.map((img, i) => (
                      <img
                        key={i}
                        src={http://localhost:5000${img}}
                        alt="Plot"
                        className="w-36 h-36 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Documents */}
              <h3 className="font-semibold mt-5 mb-2 text-gray-800">Verification Documents</h3>
              {selectedPlot.documents.length > 0 ? (
                <ul className="space-y-2">
                  {selectedPlot.documents.map((doc, i) => (
                    <li key={i}>
                      <a
                        href={http://localhost:5000${doc.url}}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {doc.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No documents uploaded.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LandownerPlots;