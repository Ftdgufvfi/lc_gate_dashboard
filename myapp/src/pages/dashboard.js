"use client";

import { useEffect, useRef, useState } from "react";
import socket from "../config/socket";
import Accordion from "react-bootstrap/Accordion";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap is imported
import zoneConfig from '../zoneconfig';
import { CheckCircle, XCircle } from "lucide-react";

const barriers = [
  { id: "B1", status: "open" },
  { id: "B2", status: "closed" },
  { id: "B3", status: "open" },
  { id: "B4", status: "closed" },
  { id: "B5", status: "open" },
  { id: "B6", status: "closed" },
];

export default function Dashboard() {
  const canvasRefs = [useRef(null), useRef(null)];
  const radarRefs = [useRef(null), useRef(null)];
  const [zoneCounts, setZoneCounts] = useState([0,0,0,0,0,0])
  const [zoneCounts_static, setZoneCounts_static] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [zoneCounts_moving, setZoneCounts_moving] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [zoneObjects, setZoneObjects] = useState([[], [], [], [], [], []]);
  const [mode, setmode] = useState("AUTOMATIC");
  const [status, setstatus] = useState("ALL GATES CLOSED");
  const [manualOverride, setManualOverride] = useState(true);
  const [showPredictions, setShowPredictions] = useState(true);
  const [zoneDetections, setZoneDetections] = useState([[], [], [], [], [], []]);


  // In your component:
  const showPredictionsRef = useRef(showPredictions);
  const layoutRef = useRef(null);
  
  // Keep ref updated with latest state
  useEffect(() => {
    showPredictionsRef.current = showPredictions;
  }, [showPredictions]);
  
  useEffect(() => {
    const handleFrame = (data) => {
      if (!data || !data.image) {
        console.error("No image data received from WebSocket.");
        return;
      }
  
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `data:image/jpeg;base64,${data.image}`;
  
      img.onload = () => {
        canvasRefs.forEach((canvasRef) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
  
          const imgWidth = img.width;
          const imgHeight = img.height;
          const aspectRatio = imgWidth / imgHeight;
  
          canvas.height = canvas.width / aspectRatio;
          const scaleX = canvas.width / imgWidth;
          const scaleY = canvas.height / imgHeight;
  
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
          const drawPredictions = showPredictionsRef.current;
  
          if (drawPredictions) {
            // Draw grid
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 2;
            for (let i = 1; i < 3; i++) {
              ctx.beginPath();
              ctx.moveTo(0, (canvas.height / 3) * i);
              ctx.lineTo(canvas.width, (canvas.height / 3) * i);
              ctx.stroke();
            }
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();
          }
  
          const newZoneCounts = [0, 0, 0, 0, 0, 0];
          const newZoneObjects = [[], [], [], [], [], []];
          const newZoneDetections = [[], [], [], [], [], []];
        
          data.detections.forEach((detection) => {
            let [x, y, width, height] = detection.bbox;
            const direction = detection.direction;
            const is_static = detection.is_static;
            const class_name = detection.class;
            const confidence = detection.confidence;

            x = Math.round(x * scaleX);
            y = Math.round(y * scaleY);
            width = Math.round(width * scaleX);
            height = Math.round(height * scaleY);

            const centerX = x + width / 2;
            const centerY = y + height;
            console.log(centerX, centerY)
        
            console.log("canvas sizes")
            console.log(canvas.height)
            zoneConfig.forEach(([x1, y1, x2, y2, is_lateral], index) => {
              // Check if centerX and centerY lie within the given zone (normalized to canvas size)
              if (
                centerX >= x1 * canvas.width && centerX <= x2 * canvas.width &&
                centerY >= y1 * canvas.height && centerY <= y2 * canvas.height
              ) {
                // Calculate relative positions (based on actual pixel values)
                const relativeX = centerX - x1 * canvas.width;
                const relativeY = centerY - y1 * canvas.height;
                newZoneDetections[index].push({ relativeX, relativeY, is_static, direction});
              }
            });
            

              const zoneX = Math.floor(centerX / (canvas.width / 2));
              const zoneY = Math.floor(centerY / (canvas.height / 3));
              const zoneIndex = zoneY * 2 + zoneX;
  
              if (zoneIndex >= 0 && zoneIndex < 6) {
                newZoneCounts[zoneIndex]++;
                newZoneObjects[zoneIndex].push(detection.class);
              }
  
              if (drawPredictions) {  
              ctx.strokeStyle = "red";
              ctx.lineWidth = 2;
              ctx.strokeRect(x, y, width, height);
  
              ctx.fillStyle = "red";
              ctx.font = "12px Arial";
              // Draw label "Object" slightly above the (x, y) coordinate
              ctx.fillText("Object", Math.max(x, 5), Math.max(y - 5, 12));
              
              // Draw a green dot at (centerX, centerY)
              ctx.beginPath(); // <-- You need this to start a new path before drawing the arc
              ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
              ctx.fillStyle = "green"; // Set fill color for the circle
              ctx.fill();
              
              }
            });
  
          setZoneCounts(newZoneCounts);
          setZoneObjects(newZoneObjects);
          setZoneDetections(newZoneDetections);
        });
      };
  
      img.onerror = () => {
        console.error("Error loading image from base64.");
      };
    };
  
    socket.on("frame", handleFrame);
    return () => {
      socket.off("frame", handleFrame);
    };
  }, []); // Still mount only once


  useEffect(() => {
    const canvas = layoutRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    const img = new Image();
    img.src = "/layout.jpeg";
  
    img.onload = () => {
      const layoutWidth = canvas.width;
      const layoutHeight = canvas.height;
  
      ctx.clearRect(0, 0, layoutWidth, layoutHeight);
      ctx.drawImage(img, 0, 0, layoutWidth, layoutHeight);

    // Original image dimensions
    const originalWidth = 450;
    const originalHeight = 410;

    // Scale factors (image → canvas)
    const scaleX = layoutWidth / originalWidth;
    const scaleY = layoutHeight / originalHeight;

    ctx.clearRect(0, 0, layoutWidth, layoutHeight);
    ctx.drawImage(img, 0, 0, layoutWidth, layoutHeight);

    // Scaled actual layout box inside canvas
    const layoutBox = {
      x1: 80 * scaleX,
      y1: 23 * scaleY,
      x2: 340 * scaleX,
      y2: 406 * scaleY,
    };

    const layoutBoxHeight = layoutBox.y2-layoutBox.y1;
    const layoutBoxWidth = layoutBox.x2-layoutBox.x1;
  
      // Each zone is 1/6th of the layout height
      const zoneHeight = layoutBoxHeight / 6;
      const zoneWidth = layoutBoxWidth;
      console.log(zoneDetections);
      zoneConfig.forEach(([x1, y1, x2, y2, is_lateral], i) => {
        const originalZoneWidth = x2*canvas.width - x1*canvas.width;
        const originalZoneHeight = y2*canvas.height - y1*canvas.height;

      zoneDetections.forEach((zone, i) => {
        let staticCount = 0;
        let movingCount = 0;

        zone.forEach(({ relativeX, relativeY, is_static, confidence }) => {
          if (is_static) {
            staticCount++;
          } else {
            movingCount++;
          }
        });

        let absX = layoutBox.x1 + 28;
        let absY = layoutBox.y1 + i * zoneHeight + 42;
        if(i == 3) absY = absY  + 9;
        
        const total_count = staticCount+movingCount

        // Draw label text "a+b (a, b)"
        const label = `${total_count} (${staticCount}, ${movingCount})`;
        ctx.beginPath()
        ctx.fillStyle = "blue";
        ctx.font = "14px Arial";  // You can adjust font size/style
        ctx.fillText(label, absX, absY);
      });


  
        // zoneDetections[i].forEach(({ relativeX, relativeY, is_static, direction}) => {

        //   const absX = layoutBox.x1
        //   const absY = layoutBox.y1+ i * zoneHeight

          // Scale relativeX, relativeY to full canvas dimensions based on zone
          // if(is_lateral == 0){
          //   const absX = layoutBox.x1+ (relativeX / originalZoneWidth) * zoneWidth;
          //   const absY = layoutBox.y1+ i * zoneHeight + (relativeY / originalZoneHeight) * zoneHeight;
          //   ctx.beginPath();
          //   ctx.arc(absX, absY, 5, 0, 2 * Math.PI);
          //   ctx.fillStyle = "red"; // You can change this to a different color
          //   ctx.fill();
          // }
          // else{
          //   const absY = layoutBox.y1+ (relativeX / originalZoneWidth) * zoneHeight;
          //   const absX = layoutBox.x1+ i * zoneHeight + (relativeY / originalZoneHeight) * zoneWidth;
          //   ctx.beginPath();
          //   ctx.arc(absX, absY, 5, 0, 2 * Math.PI);
          //   ctx.fillStyle = "red"; // You can change this to a different color
          //   ctx.fill();
          // }
        // });
      });
    };
  }, [zoneDetections]);
  
  

  return (

    <div>

    <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "24px", marginTop: "5px" }}>
      <h5 style={{ margin: 0, fontWeight: "bold" }}>LC GATE STATUS</h5>
    </div>
    
      <div className="container-fullscreen d-flex mx-3">
      {/* Left section: 2/3 width */}
      <div className="left-section d-flex flex-column">
        {/* Top half - Camera feed */}
        <div className="camera-feed flex-grow-1 p-3">

        <div className = "mx-5" style={{fontWeight: "bold", fontSize: "24px", marginTop: "5px", marginRight: '8px'}}>
        <div className="d-flex align-items-start gap-2 mx-1">
          <h6 style={{ margin: 0, fontWeight: "bold" }}>CAMERA FEED</h6>         
            <button
            onClick={() => setShowPredictions(!showPredictions)}
            title={showPredictions ? 'YOLO ON' : 'YOLO OFF'}
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '15%',
              fontSize: '14px',
              lineHeight: '1',
              border: '1px solid #ccc',
              backgroundColor: showPredictions ? '#d4edda' : '#f8f9fa',
              marginBottom: '5px',
              cursor: 'pointer',
            }}
            >
            ↑↓
            </button>
          </div>
        </div>

          <div className="d-flex gap-3">
            {canvasRefs.map((ref, index) => (
              <canvas
                key={index}
                ref={ref}
                width={400}
                height={300}
                className="border bg-black"
              />
            ))}
          </div>
        </div>

        {/* Bottom half - Radar feed */}


        <div className="radar-feed flex-grow-1 p-3">

        <div className = "mx-5" style={{fontWeight: "bold", fontSize: "24px", marginTop: "0px" }}>
          <h6 style={{ margin: 0, fontWeight: "bold" }}>RADAR FEED</h6>
        </div>

          <div className="d-flex gap-3">
            {radarRefs.map((ref, index) => (
              <canvas
                key={index}
                ref={ref}
                width={400}
                height={300}
                className="border bg-black"
              />
            ))}
          </div>
        </div>



      </div>

      {/* Right section: 1/3 width */}


      <div className="right-section p-3 my-1" style = {{marginTop: "5px"}}>

        <div className="d-flex align-items-center gap-3 status-container mb-3 mx-2" >
        {/* Blinking or Normal Status Box */}
        <div
          className={`override-box d-flex align-items-center justify-content-center fw-bold text-white ${
            manualOverride ? 'bg-danger blink' : 'bg-success'
          }` }
          style = {{ width: '230px', height: '45px', borderRadius: '4px', fontSize: '16px', whiteSpace: 'nowrap', padding: '0 0px' }}
        >
          {manualOverride ? 'Manual Override Needed' : 'Normal'}
        </div>

        {/* Mode and Status Display */}
        <div className="status-text flex-col my-4 mx-2" style = {{fontSize: '13px'}}>
          <p3 className=""><strong>MODE:</strong> {mode}</p3>
          <p3 className="mx-3"><strong>STATUS:</strong> {status}</p3>
        </div>
      </div>

      <canvas ref={layoutRef} width={450} height={550} className="mx-3 my-2" />

        {/* <img
          src="/layout.jpeg"
          alt="LC Layout"
          width={500}
          height={900}
          className = "mx-3 my-2"
        /> */}
      </div>
  </div>

    </div>


  );
}
