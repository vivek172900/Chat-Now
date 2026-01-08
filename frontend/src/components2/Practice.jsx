import { useEffect, useState, useRef } from "react";
import Peer from "peerjs";

export default function Practice() {
  const [peerId, setPeerId] = useState(""); // Your ID
  const [remoteId, setRemoteId] = useState(""); // Other user’s ID
  const [peer, setPeer] = useState(null);
  const [conn, setConn] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    // Initialize Peer
    const newPeer = new Peer();

    newPeer.on("open", (id) => {
      setPeerId(id); // Set your unique ID
    });

    newPeer.on("connection", (connection) => {
      setConn(connection);
      connection.on("data", (data) => {
        console.log("Received:", data);
      });
    });

    newPeer.on("call", (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        setLocalStream(stream);
        localVideoRef.current.srcObject = stream;
        call.answer(stream); // Answer call with your stream

        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
      });
    });

    setPeer(newPeer);
  }, []);

  const callPeer = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setLocalStream(stream);
      localVideoRef.current.srcObject = stream;

      const call = peer.call(remoteId, stream);
      call.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });
    });
  };

  return (
    <div>
      <h3>Your ID: {peerId}</h3>
      <input
        type="text"
        placeholder="Enter remote ID"
        value={remoteId}
        onChange={(e) => setRemoteId(e.target.value)}
      />
      <button onClick={callPeer}>Call</button>

      <h4>Local Video</h4>
      <video ref={localVideoRef} autoPlay playsInline style={{ width: "300px" }} />

      <h4>Remote Video</h4>
      <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "300px" }} />
    </div>
  );
}
