import fetch from "node-fetch";
import base64 from "base-64";

const zoomAccountId = "HbTmXhPjSqe2OT7Wf1Hxtg";
const zoomClientId = "9nZpo9oiRtS8L93rpi3KRA";
const zoomClientSecret = "DXT8JOqqB2YPNJKbz5zsG7a5M5QknZjf";

const getAuthHeaders = () => {
  return {
    Authorization: `Basic ${base64.encode(`${zoomClientId}:${zoomClientSecret}`)}`,
    "Content-Type": "application/json"
  };
};

const generateZoomAccessToken = async () => {
  try {
    const response = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${zoomAccountId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );

    const jsonResponse = await response.json();
    return jsonResponse?.access_token;
  } catch (error) {
    console.log("generateZoomAccessToken Error ", error);
    throw error;
  }
};

export const generateZoomMeeting = async () => {
  try {
    const zoomAccessToken = await generateZoomAccessToken();
    const response = await fetch(`https://api.zoom.us/v2/users/me/meetings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${zoomAccessToken}`
      },
      body: JSON.stringify({
        agenda: 'My Meeting',
        default_password: false,
        duration: 60,
        password: '12345',
        settings: {
          allow_multiple_devices: true,
          alternative_hosts_email_notification: true,
          breakout_room: {
            enable: true,
            rooms: [{
              name: 'room1',
              participants: ["samviswas6405@gmail.com", "samviswas62@gmail.com"],
            }],
          },
          calendar_type: 1,
          contact_email: "samviswas6405@gmail.com",
          contact_name: "sam viswas",
          email_notification: true,
          encryption_type: 'enhanced_encryption',
          focus_mode: true,
          host_video: true,
          join_before_host: true,
          meeting_authentication: true,
          meeting_invitees: [{
            email: "samviswas6405@gmail.com"
          }],
          mute_upon_entry: true,
          participant_video: true,
          private_meeting: true,
          waiting_room: false,
          watermark: false,
          continuous_meeting_chat: {
            enable: true,
          },
        },
        start_time: new Date().toLocaleDateString(),
        timezone: 'Asia/Kolkata',
        topic: 'My Meeting',
        type: 2
      }),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.log("generateZoomMeeting Error ", error);
    throw error;
  }
};
