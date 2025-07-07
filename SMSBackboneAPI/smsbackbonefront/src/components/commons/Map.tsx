import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import { scaleLinear } from "d3-scale";

const geoUrl = "/SMS/Map/mexicoHigh.json";

// Datos de ejemplo
const enviadosData = [
  { stateName: "Jalisco", messages: 120 },
  { stateName: "Ciudad de México", messages: 200 },
  { stateName: "Estado de México", messages: 90 },
  { stateName: "Nuevo León", messages: 50 },
  { stateName: "Baja California", messages: 10 },
  { stateName: "Chiapas", messages: 75 },
  { stateName: "Guerrero", messages: 35 },
  { stateName: "Yucatán", messages: 60 },
  { stateName: "Puebla", messages: 95 },
  { stateName: "Sonora", messages: 20 },
  { stateName: "Querétaro", messages: 110 },
  { stateName: "Guanajuato", messages: 130 },
  { stateName: "Michoacán", messages: 80 },
  { stateName: "Zacatecas", messages: 45 },
  { stateName: "Sinaloa", messages: 55 },
];


const respondidosData = [
  { stateName: "Jalisco", messages: 60 },
  { stateName: "Ciudad de México", messages: 170 },
  { stateName: "Estado de México", messages: 30 },
  { stateName: "Nuevo León", messages: 15 },
  { stateName: "Chiapas", messages: 40 },
  { stateName: "Guerrero", messages: 25 },
  { stateName: "Yucatán", messages: 50 },
  { stateName: "Puebla", messages: 70 },
  { stateName: "Sonora", messages: 10 },
  { stateName: "Querétaro", messages: 90 },
  { stateName: "Guanajuato", messages: 95 },
  { stateName: "Michoacán", messages: 50 },
  { stateName: "Zacatecas", messages: 20 },
  { stateName: "Sinaloa", messages: 40 },
];

// Escala global
const maxMessages = Math.max(
  ...[...enviadosData, ...respondidosData].map(d => d.messages)
);

const colorScale = scaleLinear<string>()
  .domain([0, maxMessages])
  .range(["#E0E0E0", "#8F4E63"]);

const MapChart = ({
    enviadosData,
    respondidosData
}: {
    enviadosData: { stateName: string; messages: number }[];
    respondidosData: { stateName: string; messages: number }[];
}) => {
  const [tab, setTab] = useState(0);
  const [tooltipContent, setTooltipContent] = useState("");

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const activeData = tab === 0 ? enviadosData : respondidosData;
  const label = tab === 0 ? "mensajes enviados" : "mensajes respondidos";
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  return (
    <Box sx={{ width: "100%", height: "auto" }}>
      <Tabs value={tab} onChange={handleTabChange} centered sx={{ marginBottom: "12px" }}>
        <Tab label="MENSAJES ENVIADOS" sx={{ fontFamily: "Poppins", fontWeight: 600 }} />
        <Tab label="MENSAJES RESPONDIDOS" sx={{ fontFamily: "Poppins", fontWeight: 400 }} />
      </Tabs>

      <MapaPorDataset
        messageData={activeData}
        tooltipContent={tooltipContent}
        setTooltipContent={setTooltipContent}
        tooltipPosition={tooltipPosition}
        setTooltipPosition={setTooltipPosition}
        colorScale={colorScale}
        label={label}
      />
    </Box>
  );
};

type MapaProps = {
  messageData: { stateName: string; messages: number }[];
  tooltipContent: string;
  setTooltipContent: (val: string) => void;
  tooltipPosition: { x: number; y: number }; 
  setTooltipPosition: (val: { x: number; y: number }) => void; 
  colorScale: (val: number) => string;
  label: string;
};

const MapaPorDataset = ({
  messageData,
  tooltipContent,
  tooltipPosition, 
  setTooltipContent,
  setTooltipPosition,
  colorScale,
  label,
}: MapaProps) => {
  return (
    <Box sx={{ position: "relative", height: "380px", width: "100%" }}>
      {tooltipContent && (
        <Box
          sx={{
            position: "fixed",
            top: tooltipPosition.y - 50,
            left: tooltipPosition.x - 50,
            background: "#2E2E2E",
            padding: "6px 12px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
            fontSize: "14px",
            fontFamily: "Poppins, sans-serif",
            color: "#FFFFFF",
            pointerEvents: "none",
            zIndex: 1500,
            whiteSpace: "nowrap",
          }}
        >
          {tooltipContent}
        </Box>
      )}


      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 900, center: [-102, 23] }}
        width={800}
        height={440}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = geo.properties.name;
              const stateData = messageData.find((s) => s.stateName === stateName);
              const fillColor = stateData ? colorScale(stateData.messages) : "#E0E0E0";

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fillColor}
                  stroke="#FFF"
                  strokeWidth={0.5}
                  onMouseEnter={(event) => {
                    const { clientX, clientY } = event;
                    const mensajes = stateData?.messages ?? 0;
                    setTooltipContent(`${stateName}: ${mensajes} ${label}`);
                    setTooltipPosition({ x: clientX, y: clientY });
                  }}
                  onMouseLeave={() => setTooltipContent("")}

                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

    </Box>
  );
};

export default MapChart;
