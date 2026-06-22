import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Autocomplete from "@mui/material/Autocomplete";

import { fetchAgencyGuides } from "auth/adminAgenceAuth";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import { styled } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 React context
import { useMaterialUIController } from "context";
import { apiUpload } from "api/apiClient";

const steps = ["Informations Générales", "Logistique & Guide", "Hébergement & Agence", "Programme"];

const normalizePackData = (data) => {
  if (!data) return null;

  return {
    title: data.title || "",
    price: data.price != null && data.price !== "" ? String(data.price) : "",
    departureDate: data.departureDate || "",
    arrivalDate: data.arrivalDate || "",
    description: data.description || "",
    hotelMekkah: data.hotelMekkah || "",
    hotelMekkahStars: data.hotelMekkahStars || "5",
    hotelMedina: data.hotelMedina || "",
    hotelMedinaStars: data.hotelMedinaStars || "4",
    volDirect: data.volDirect !== false,
    hasEscale: Boolean(data.hasEscale),
    escaleDetails: data.escaleDetails || "",
    visaInclus: data.visaInclus !== false,
    transfert: data.transfert !== false,
    guideName: data.guideName || "",
    guideId: data.guideId || "",
    guideLanguages: Array.isArray(data.guideLanguages) ? data.guideLanguages : [],
    agencyAddress: data.agencyAddress || "",
    lat: data.lat != null ? Number(data.lat) : 36.8065,
    lng: data.lng != null ? Number(data.lng) : 10.1815,
    imageUrl: data.imageUrl || "",
    priceSharedRoom: data.priceSharedRoom != null ? String(data.priceSharedRoom) : "",
    priceIndividualRoom: data.priceIndividualRoom != null ? String(data.priceIndividualRoom) : "",
    priceAdult: data.priceAdult != null ? String(data.priceAdult) : "",
    priceChild: data.priceChild != null ? String(data.priceChild) : "",
    priceSenior: data.priceSenior != null ? String(data.priceSenior) : "",
    hotelMekkahImages: Array.isArray(data.hotelMekkahImages) ? data.hotelMekkahImages : [],
    hotelMedinaImages: Array.isArray(data.hotelMedinaImages) ? data.hotelMedinaImages : [],
    program:
      Array.isArray(data.program) && data.program.length > 0
        ? data.program
        : [{ day: "Jour 1", title: "Arrivée", description: "" }],
  };
};

export const buildPackSavePayload = (packData) => {
  const { id, agencyId, agency, agencyName, agencyLogo, status, createdAt, updatedAt, ...rest } =
    packData;

  return {
    ...rest,
    guideId: rest.guideId || null,
  };
};

const SabeelConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 18,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#1a1a1a",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#1a1a1a",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderTopWidth: 2,
    borderRadius: 1,
    transition: "all 0.3s ease",
    zIndex: 0,
    position: "relative",
  },
  [`&.${stepConnectorClasses.active}, &.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "rgba(255, 255, 255, 0.9)",
    },
  },
}));

function LeafletMap({ position, onPositionSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const onPositionSelectRef = useRef(onPositionSelect);

  useEffect(() => {
    onPositionSelectRef.current = onPositionSelect;
  }, [onPositionSelect]);

  useEffect(() => {
    let isCancelled = false;

    function initMap() {
      if (!mapRef.current || mapInstanceRef.current || isCancelled) return;
      if (mapRef.current._leaflet_id) return;

      const L = window.L;
      const initialMap = L.map(mapRef.current).setView([position.lat, position.lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(initialMap);

      const initialMarker = L.marker([position.lat, position.lng], { draggable: true }).addTo(
        initialMap
      );

      initialMarker.on("dragend", function () {
        const pos = initialMarker.getLatLng();
        onPositionSelectRef.current(pos.lat, pos.lng);
      });

      initialMap.on("click", function (e) {
        initialMarker.setLatLng(e.latlng);
        onPositionSelectRef.current(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = initialMap;
      markerRef.current = initialMarker;

      requestAnimationFrame(() => {
        if (!isCancelled && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
    }

    if (!window.L) {
      const existingScript = document.querySelector('script[src*="leaflet@1.9.4"]');
      const existingLink = document.querySelector('link[href*="leaflet@1.9.4"]');

      if (!existingLink) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (existingScript) {
        existingScript.addEventListener("load", initMap);
      } else {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = initMap;
        document.body.appendChild(script);
      }
    } else {
      initMap();
    }

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    const updatePosition = () => {
      if (!mapInstanceRef.current || !markerRef.current) return;
      markerRef.current.setLatLng([position.lat, position.lng]);
      mapInstanceRef.current.setView(
        [position.lat, position.lng],
        mapInstanceRef.current.getZoom(),
        {
          animate: false,
        }
      );
    };

    if (map._loaded) {
      updatePosition();
    } else {
      map.whenReady(updatePosition);
    }
  }, [position.lat, position.lng]);

  return (
    <MDBox
      ref={mapRef}
      width="100%"
      height="220px"
      borderRadius="lg"
      sx={{ border: "1px solid #ddd", zIndex: 1 }}
    />
  );
}

LeafletMap.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  onPositionSelect: PropTypes.func.isRequired,
};

function AddPackForm({ onCancel, onSave, initialData, initialStep = 0 }) {
  const [activeStep, setActiveStep] = useState(initialStep);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showMekkahDetails, setShowMekkahDetails] = useState(false);
  const [showMedinaDetails, setShowMedinaDetails] = useState(false);

  const [packImagePreviewUrl, setPackImagePreviewUrl] = useState(initialData?.imageUrl || "");

  const [availableGuides, setAvailableGuides] = useState([]);

  useEffect(() => {
    const loadGuides = async () => {
      try {
        const guides = await fetchAgencyGuides();
        setAvailableGuides(Array.isArray(guides) ? guides : []);
      } catch (e) {
        console.error("Failed to load guides:", e);
        setAvailableGuides([]);
      }
    };

    loadGuides();
  }, []);

  const [packData, setPackData] = useState(() => {
    if (initialData) return normalizePackData(initialData);
    return normalizePackData({
      volDirect: true,
      hasEscale: false,
      visaInclus: true,
      transfert: true,
      hotelMekkahStars: "5",
      hotelMedinaStars: "4",
      lat: 36.8065,
      lng: 10.1815,
      program: [{ day: "Jour 1", title: "Arrivée", description: "" }],
    });
  });

  useEffect(() => {
    if (!initialData) return;

    const normalized = normalizePackData(initialData);
    setPackData(normalized);
    setPackImagePreviewUrl(normalized.imageUrl || "");
    setShowMekkahDetails(
      Boolean(normalized.hotelMekkahStars || normalized.hotelMekkahImages.length > 0)
    );
    setShowMedinaDetails(
      Boolean(normalized.hotelMedinaStars || normalized.hotelMedinaImages.length > 0)
    );
    setActiveStep(initialStep);
  }, [initialData, initialStep]);

  const getSelectedGuideValue = () => {
    if (packData.guideId) {
      return availableGuides.find((guide) => guide.id === packData.guideId) || null;
    }

    if (packData.guideName) {
      const matchedGuide = availableGuides.find(
        (guide) => `${guide.firstName || ""} ${guide.lastName || ""}`.trim() === packData.guideName
      );
      return matchedGuide || packData.guideName;
    }

    return null;
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return (
          packData.title &&
          packData.price &&
          packData.departureDate &&
          packData.arrivalDate &&
          packData.description
        );
      case 1:
        return true; // Guide optional
      case 2:
        return packData.hotelMekkah && packData.hotelMedina && packData.agencyAddress;
      case 3:
        return packData.program.length > 0 && packData.program[0].title;
      default:
        return false;
    }
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPackData({ ...packData, [name]: value });
  };

  const handleGeocode = async () => {
    if (!packData.agencyAddress) return;
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          packData.agencyAddress
        )}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setPackData((prev) => ({ ...prev, lat: parseFloat(lat), lng: parseFloat(lon) }));
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSwitchChange = (name) => {
    setPackData({ ...packData, [name]: !packData[name] });
  };

  const handleAddProgramDay = () => {
    setPackData({
      ...packData,
      program: [
        ...packData.program,
        { day: `Jour ${packData.program.length + 1}`, title: "", description: "" },
      ],
    });
  };

  const handleProgramChange = (index, field, value) => {
    const updatedProgram = [...packData.program];
    updatedProgram[index][field] = value;
    setPackData({ ...packData, program: updatedProgram });
  };

  const handleSubmit = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onSave(buildPackSavePayload(packData));
    }, 1500);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDBox display="flex" alignItems="center" mb={2}>
                <Icon color="dark" sx={{ mr: 1 }}>
                  description
                </Icon>
                <MDTypography variant="h6" fontWeight="bold">
                  Détails Généraux du Voyage
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={8}>
              <MDInput
                label="Titre du Pack"
                name="title"
                value={packData.title}
                onChange={handleInputChange}
                fullWidth
                placeholder="Ex: Omra Premium - Ramadan 2024"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <MDInput
                label="Prix à partir de (DT)"
                name="price"
                type="number"
                value={packData.price}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <MDTypography
                variant="button"
                fontWeight="medium"
                color="text"
                display="block"
                mb={1}
              >
                Image de couverture du pack (Marketing)
              </MDTypography>
              <MDBox
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                p={4}
                borderRadius="xl"
                sx={{
                  border: "2px dashed #ddd",
                  backgroundColor: "#f8f9fa",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": { borderColor: "dark.main", backgroundColor: "#f8f9fa" },
                }}
                onClick={() => document.getElementById("pack-image-upload").click()}
              >
                {packImagePreviewUrl ? (
                  <MDBox
                    component="img"
                    src={packImagePreviewUrl}
                    alt="Cover"
                    width="100%"
                    maxHeight="250px"
                    sx={{ objectFit: "contain", borderRadius: "lg" }}
                  />
                ) : (
                  <>
                    <Icon fontSize="large" color="dark" sx={{ mb: 1 }}>
                      add_photo_alternate
                    </Icon>
                    <MDTypography variant="button" color="text" fontWeight="medium">
                      Cliquez pour télécharger une image haute résolution
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      PNG, JPG ou JPEG (Max 5MB)
                    </MDTypography>
                  </>
                )}
                <input
                  type="file"
                  id="pack-image-upload"
                  hidden
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPackImagePreviewUrl(reader.result);
                    };
                    reader.readAsDataURL(file);

                    try {
                      const formData = new FormData();
                      formData.append("image", file);
                      const response = await apiUpload(
                        "/admin-agence/pack-umrah/upload-image",
                        formData
                      );

                      setPackData((prev) => ({
                        ...prev,
                        imageUrl: response?.imageUrl || "",
                      }));

                      if (response?.presignedUrl) {
                        setPackImagePreviewUrl(response.presignedUrl);
                      }
                    } catch (error) {
                      console.error("Pack image upload failed", error);
                      alert("Échec de l'upload de l'image.");
                      setPackData((prev) => ({ ...prev, imageUrl: "" }));
                    }
                  }}
                />
              </MDBox>
              {packImagePreviewUrl && (
                <MDBox mt={1} textAlign="right">
                  <MDButton
                    variant="text"
                    color="error"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPackData({ ...packData, imageUrl: "" });
                      setPackImagePreviewUrl("");
                    }}
                  >
                    Changer l&apos;image
                  </MDButton>
                </MDBox>
              )}
              <Divider sx={{ my: 3 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                label="Date de départ"
                name="departureDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={packData.departureDate}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                label="Date d'arrivée"
                name="arrivalDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={packData.arrivalDate}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="Description détaillée du voyage"
                name="description"
                multiline
                rows={5}
                value={packData.description}
                onChange={handleInputChange}
                fullWidth
                placeholder="Décrivez les points forts de ce pack..."
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDBox display="flex" alignItems="center" mb={2}>
                <Icon color="dark" sx={{ mr: 1 }}>
                  person
                </Icon>
                <MDTypography variant="h6" fontWeight="bold">
                  Accompagnement & Guide
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={availableGuides}
                getOptionLabel={(option) => {
                  if (typeof option === "string") return option;
                  return `${option.firstName || ""} ${option.lastName || ""}`.trim();
                }}
                value={getSelectedGuideValue()}
                onChange={(event, newValue) => {
                  if (!newValue) {
                    setPackData({
                      ...packData,
                      guideId: "",
                      guideName: "",
                      guideLanguages: [],
                    });
                    return;
                  }

                  if (typeof newValue === "string") {
                    setPackData({
                      ...packData,
                      guideId: "",
                      guideName: newValue,
                    });
                    return;
                  }

                  const fullName = `${newValue.firstName || ""} ${newValue.lastName || ""}`.trim();
                  setPackData({
                    ...packData,
                    guideId: newValue.id || "",
                    guideName: fullName,
                    guideLanguages: Array.isArray(newValue.languages)
                      ? newValue.languages
                      : packData.guideLanguages,
                  });
                }}
                renderInput={(params) => (
                  <MDInput {...params} label="Choisir un guide (Optionnel)" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={["Français", "Arabe", "Anglais", "Turc", "Italien"]}
                renderInput={(params) => <MDInput {...params} label="Langues du guide" fullWidth />}
                value={packData.guideLanguages || []}
                onChange={(event, newValue) =>
                  setPackData({ ...packData, guideLanguages: newValue })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <MDBox display="flex" alignItems="center" mb={2}>
                <Icon color="dark" sx={{ mr: 1 }}>
                  airplane_ticket
                </Icon>
                <MDTypography variant="h6" fontWeight="bold">
                  Logistique & Transport
                </MDTypography>
              </MDBox>
              <MDBox
                display="flex"
                flexWrap="wrap"
                gap={4}
                p={2}
                borderRadius="lg"
                sx={{ backgroundColor: "#f8f9fa", border: "1px solid #eee" }}
              >
                <MDBox display="flex" alignItems="center">
                  <Switch
                    color="dark"
                    checked={packData.volDirect}
                    onChange={() => {
                      setPackData({
                        ...packData,
                        volDirect: !packData.volDirect,
                        hasEscale: packData.volDirect ? packData.hasEscale : false,
                      });
                    }}
                  />
                  <MDBox ml={1}>
                    <MDTypography variant="button" fontWeight="medium">
                      Vol Direct
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      Sans escale intermédiaire
                    </MDTypography>
                  </MDBox>
                </MDBox>
                {!packData.volDirect && (
                  <MDBox display="flex" alignItems="center">
                    <Switch
                      color="dark"
                      checked={packData.hasEscale}
                      onChange={() => handleSwitchChange("hasEscale")}
                    />
                    <MDBox ml={1}>
                      <MDTypography variant="button" fontWeight="medium">
                        Avec Escale
                      </MDTypography>
                      <MDTypography variant="caption" color="text" display="block">
                        Précisez les détails du trajet
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                )}
                <MDBox display="flex" alignItems="center">
                  <Switch
                    color="success"
                    checked={packData.visaInclus}
                    onChange={() => handleSwitchChange("visaInclus")}
                  />
                  <MDBox ml={1}>
                    <MDTypography variant="button" fontWeight="medium">
                      Visa Inclus
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      Frais de visa compris
                    </MDTypography>
                  </MDBox>
                </MDBox>
                <MDBox display="flex" alignItems="center">
                  <Switch
                    color="success"
                    checked={packData.transfert}
                    onChange={() => handleSwitchChange("transfert")}
                  />
                  <MDBox ml={1}>
                    <MDTypography variant="button" fontWeight="medium">
                      Transferts VIP
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      Transport premium sur place
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </MDBox>
            </Grid>
            {!packData.volDirect && packData.hasEscale && (
              <Grid item xs={12}>
                <MDInput
                  label="Détails de l'escale"
                  name="escaleDetails"
                  multiline
                  rows={2}
                  value={packData.escaleDetails}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="Ex: Escale à Istanbul (2h), Compagnie Turkish Airlines..."
                />
              </Grid>
            )}
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            {/* Mecca Hotel Section */}
            <Grid item xs={12} md={6}>
              <MDBox display="flex" alignItems="center" mb={1}>
                <Icon color="dark" fontSize="small" sx={{ mr: 1 }}>
                  hotel
                </Icon>
                <MDTypography variant="button" fontWeight="bold">
                  Hôtel Mecque
                </MDTypography>
              </MDBox>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <MDInput
                    label="Nom de l'Hôtel"
                    name="hotelMekkah"
                    value={packData.hotelMekkah}
                    onChange={handleInputChange}
                    fullWidth
                  />
                  <MDBox mt={0.5}>
                    <MDTypography
                      variant="caption"
                      color="info"
                      fontWeight="medium"
                      sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                      onClick={() => setShowMekkahDetails(!showMekkahDetails)}
                    >
                      <Icon sx={{ mr: 0.5, fontSize: "small !important" }}>
                        {showMekkahDetails ? "remove_circle" : "add_circle"}
                      </Icon>
                      {showMekkahDetails
                        ? "Masquer les détails"
                        : "Ajouter détails hôtel (Étoiles, Photos)"}
                    </MDTypography>
                  </MDBox>
                </Grid>

                {showMekkahDetails && (
                  <>
                    <Grid item xs={12}>
                      <Autocomplete
                        options={["3", "4", "5"]}
                        renderInput={(params) => (
                          <MDInput {...params} label="Nombre d'étoiles" fullWidth size="small" />
                        )}
                        value={packData.hotelMekkahStars}
                        onChange={(e, v) => setPackData({ ...packData, hotelMekkahStars: v })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="bold"
                        mb={1}
                        display="block"
                      >
                        Galerie Photos
                      </MDTypography>
                      <MDBox display="flex" gap={1} flexWrap="wrap">
                        <MDBox
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          justifyContent="center"
                          width="60px"
                          height="60px"
                          borderRadius="md"
                          sx={{
                            border: "1px dashed #ddd",
                            backgroundColor: "#f8f9fa",
                            cursor: "pointer",
                            "&:hover": { borderColor: "dark.main" },
                          }}
                          onClick={() => document.getElementById("mekkah-images-upload").click()}
                        >
                          <Icon color="dark" fontSize="small">
                            add
                          </Icon>
                        </MDBox>
                        {packData.hotelMekkahImages.map((img, idx) => (
                          <MDBox
                            key={idx}
                            position="relative"
                            width="60px"
                            height="60px"
                            borderRadius="md"
                            sx={{ overflow: "hidden", border: "1px solid #eee" }}
                          >
                            <MDBox
                              component="img"
                              src={img}
                              width="100%"
                              height="100%"
                              sx={{ objectFit: "cover" }}
                            />
                            <MDBox
                              position="absolute"
                              top={0}
                              right={0}
                              bgcolor="rgba(255,255,255,0.8)"
                              borderRadius="50%"
                              sx={{ cursor: "pointer" }}
                              onClick={() => {
                                const newImages = [...packData.hotelMekkahImages];
                                newImages.splice(idx, 1);
                                setPackData({ ...packData, hotelMekkahImages: newImages });
                              }}
                            >
                              <Icon fontSize="inherit" color="error">
                                cancel
                              </Icon>
                            </MDBox>
                          </MDBox>
                        ))}
                      </MDBox>
                      <input
                        type="file"
                        id="mekkah-images-upload"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          files.forEach((file) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPackData((prev) => ({
                                ...prev,
                                hotelMekkahImages: [...prev.hotelMekkahImages, reader.result],
                              }));
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>

            {/* Medina Hotel Section */}
            <Grid item xs={12} md={6}>
              <MDBox display="flex" alignItems="center" mb={1}>
                <Icon color="dark" fontSize="small" sx={{ mr: 1 }}>
                  apartment
                </Icon>
                <MDTypography variant="button" fontWeight="bold">
                  Hôtel Médine
                </MDTypography>
              </MDBox>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <MDInput
                    label="Nom de l'Hôtel"
                    name="hotelMedina"
                    value={packData.hotelMedina}
                    onChange={handleInputChange}
                    fullWidth
                  />
                  <MDBox mt={0.5}>
                    <MDTypography
                      variant="caption"
                      color="info"
                      fontWeight="medium"
                      sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                      onClick={() => setShowMedinaDetails(!showMedinaDetails)}
                    >
                      <Icon sx={{ mr: 0.5, fontSize: "small !important" }}>
                        {showMedinaDetails ? "remove_circle" : "add_circle"}
                      </Icon>
                      {showMedinaDetails
                        ? "Masquer les détails"
                        : "Ajouter détails hôtel (Étoiles, Photos)"}
                    </MDTypography>
                  </MDBox>
                </Grid>

                {showMedinaDetails && (
                  <>
                    <Grid item xs={12}>
                      <Autocomplete
                        options={["3", "4", "5"]}
                        renderInput={(params) => (
                          <MDInput {...params} label="Nombre d'étoiles" fullWidth size="small" />
                        )}
                        value={packData.hotelMedinaStars}
                        onChange={(e, v) => setPackData({ ...packData, hotelMedinaStars: v })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="bold"
                        mb={1}
                        display="block"
                      >
                        Galerie Photos
                      </MDTypography>
                      <MDBox display="flex" gap={1} flexWrap="wrap">
                        <MDBox
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          justifyContent="center"
                          width="60px"
                          height="60px"
                          borderRadius="md"
                          sx={{
                            border: "1px dashed #ddd",
                            backgroundColor: "#f8f9fa",
                            cursor: "pointer",
                            "&:hover": { borderColor: "dark.main" },
                          }}
                          onClick={() => document.getElementById("medina-images-upload").click()}
                        >
                          <Icon color="dark" fontSize="small">
                            add
                          </Icon>
                        </MDBox>
                        {packData.hotelMedinaImages.map((img, idx) => (
                          <MDBox
                            key={idx}
                            position="relative"
                            width="60px"
                            height="60px"
                            borderRadius="md"
                            sx={{ overflow: "hidden", border: "1px solid #eee" }}
                          >
                            <MDBox
                              component="img"
                              src={img}
                              width="100%"
                              height="100%"
                              sx={{ objectFit: "cover" }}
                            />
                            <MDBox
                              position="absolute"
                              top={0}
                              right={0}
                              bgcolor="rgba(255,255,255,0.8)"
                              borderRadius="50%"
                              sx={{ cursor: "pointer" }}
                              onClick={() => {
                                const newImages = [...packData.hotelMedinaImages];
                                newImages.splice(idx, 1);
                                setPackData({ ...packData, hotelMedinaImages: newImages });
                              }}
                            >
                              <Icon fontSize="inherit" color="error">
                                cancel
                              </Icon>
                            </MDBox>
                          </MDBox>
                        ))}
                      </MDBox>
                      <input
                        type="file"
                        id="medina-images-upload"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          files.forEach((file) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPackData((prev) => ({
                                ...prev,
                                hotelMedinaImages: [...prev.hotelMedinaImages, reader.result],
                              }));
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Pricing Section */}
            <Grid item xs={12} md={6}>
              <MDBox display="flex" alignItems="center" mb={1}>
                <Icon color="dark" fontSize="small" sx={{ mr: 1 }}>
                  payments
                </Icon>
                <MDTypography variant="button" fontWeight="bold">
                  Prix par Chambre (DT)
                </MDTypography>
              </MDBox>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <MDInput
                    label="Commune"
                    name="priceSharedRoom"
                    type="number"
                    value={packData.priceSharedRoom}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <MDInput
                    label="Individuelle"
                    name="priceIndividualRoom"
                    type="number"
                    value={packData.priceIndividualRoom}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <MDBox display="flex" alignItems="center" mb={1}>
                <Icon color="dark" fontSize="small" sx={{ mr: 1 }}>
                  groups
                </Icon>
                <MDTypography variant="button" fontWeight="bold">
                  Prix par Personne (DT)
                </MDTypography>
              </MDBox>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <MDInput
                    label="Adulte"
                    name="priceAdult"
                    type="number"
                    value={packData.priceAdult}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={4}>
                  <MDInput
                    label="Enfant"
                    name="priceChild"
                    type="number"
                    value={packData.priceChild}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={4}>
                  <MDInput
                    label="Bébé"
                    name="priceSenior"
                    type="number"
                    value={packData.priceSenior}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Agency Location Section */}
            <Grid item xs={12}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <MDBox display="flex" alignItems="center" mb={1}>
                    <Icon color="dark" fontSize="small" sx={{ mr: 1 }}>
                      location_on
                    </Icon>
                    <MDTypography variant="button" fontWeight="bold">
                      Adresse de l&apos;agence
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" gap={1}>
                    <MDInput
                      label="Localisation"
                      name="agencyAddress"
                      value={packData.agencyAddress}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                    />
                    <MDButton
                      variant="gradient"
                      color="dark"
                      size="small"
                      onClick={handleGeocode}
                      disabled={isGeocoding || !packData.agencyAddress}
                    >
                      {isGeocoding ? <CircularProgress size={16} color="inherit" /> : "Fixer"}
                    </MDButton>
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6}>
                  <LeafletMap
                    position={{ lat: packData.lat, lng: packData.lng }}
                    onPositionSelect={(lat, lng) => setPackData((prev) => ({ ...prev, lat, lng }))}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <MDBox>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <MDTypography variant="h6">Détails par jour</MDTypography>
              <MDButton variant="outlined" color="dark" size="small" onClick={handleAddProgramDay}>
                Ajouter une journée
              </MDButton>
            </MDBox>
            {packData.program.map((day, idx) => (
              <MDBox key={idx} mb={2} p={2} borderRadius="lg" sx={{ backgroundColor: "#f8f9fa" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={2}>
                    <MDInput
                      label="Jour"
                      value={day.day}
                      onChange={(e) => handleProgramChange(idx, "day", e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={10}>
                    <MDInput
                      label="Titre / Activité"
                      value={day.title}
                      onChange={(e) => handleProgramChange(idx, "title", e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      label="Description"
                      multiline
                      rows={2}
                      value={day.description}
                      onChange={(e) => handleProgramChange(idx, "description", e.target.value)}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </MDBox>
            ))}
          </MDBox>
        );
      default:
        return null;
    }
  };

  return (
    <MDBox pt={3} pb={3}>
      <Card>
        <MDBox p={3}>
          <MDBox mb={2}>
            <MDTypography variant="h4" fontWeight="bold">
              {initialData ? "Optimiser le Pack Umrah" : "Création d'un Pack Umrah d'Exception"}
            </MDTypography>
            <MDTypography variant="button" color="text" fontWeight="regular">
              {initialData
                ? "Ajustez les détails pour offrir la meilleure expérience."
                : "Concevez un voyage spirituel inoubliable avec des services premium."}
            </MDTypography>
          </MDBox>

          <MDBox
            variant="gradient"
            bgColor="success"
            borderRadius="lg"
            coloredShadow="success"
            py={1.5}
            px={2}
            mb={4}
          >
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              connector={<SabeelConnector />}
              sx={{ background: "transparent" }}
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <MDBox
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width="36px"
                        height="36px"
                        borderRadius="50%"
                        color={
                          activeStep === index
                            ? "success.main"
                            : activeStep > index
                            ? "white"
                            : "grey.500"
                        }
                        sx={{
                          border: activeStep === index ? "none" : "2px solid rgba(255,255,255,0.4)",
                          boxShadow: activeStep === index ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          fontSize: "0.9rem",
                          fontWeight: "bold",
                          zIndex: 2,
                          position: "relative",
                          backgroundColor:
                            activeStep === index
                              ? "#ffffff"
                              : activeStep > index
                              ? "#1a1a1a"
                              : "rgba(255,255,255,0.1)",
                        }}
                      >
                        {index + 1}
                      </MDBox>
                    )}
                    sx={{
                      "& .MuiStepLabel-label": {
                        fontWeight: activeStep === index ? "bold" : "regular",
                        color: "white !important",
                        mt: 1,
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </MDBox>

          <MDBox mt={4} minHeight="300px">
            {renderStepContent(activeStep)}
          </MDBox>

          <MDBox display="flex" justifyContent="space-between" mt={5}>
            <MDButton
              variant="outlined"
              color="dark"
              onClick={activeStep === 0 ? onCancel : handleBack}
              sx={{
                color: activeStep === 0 ? "inherit" : "white !important",
                backgroundColor: activeStep === 0 ? "transparent" : "#1a1a1a",
              }}
            >
              {activeStep === 0 ? "Annuler" : "Retour"}
            </MDButton>
            <MDBox display="flex" gap={2}>
              {activeStep < steps.length - 1 ? (
                <MDButton
                  variant="gradient"
                  color="dark"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  sx={{ color: "white !important" }}
                >
                  Suivant
                </MDButton>
              ) : (
                <MDButton
                  variant="gradient"
                  color="dark"
                  onClick={handleSubmit}
                  disabled={!isStepValid()}
                  sx={{ color: "white !important" }}
                >
                  {initialData ? "Enregistrer les modifications" : "Publier le Pack"}
                </MDButton>
              )}
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          {initialData
            ? "Le pack a été mis à jour avec succès !"
            : "Le pack Umrah a été publié avec succès !"}
        </Alert>
      </Snackbar>
    </MDBox>
  );
}

AddPackForm.defaultProps = {
  initialData: null,
  initialStep: 0,
};

AddPackForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  initialStep: PropTypes.number,
};

export default AddPackForm;
