// src/utils/roomCode.js

/*
  INSTRUCTIONS FOR ME (CHISOM):
  1. This utility generates random 6-character alphanumeric room codes.
  2. It's used in RoomLobby when I click "Create Room".
  3. The code format: uppercase letters + numbers (e.g., "ABC123", "X7K9P2").
  4. I export it so I can import it anywhere I need to generate a room code.
  5. It excludes easily confused characters like 0, O, 1, I to avoid user confusion.
*/

// Characters to use in room codes (excluding 0, O, 1, I to avoid confusion)
const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

// Generate a random room code
export const generateRoomCode = () => {
  let result = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
    result += CHARACTERS[randomIndex];
  }
  return result;
};

// Validate a room code format (optional helper)
export const isValidRoomCode = (code) => {
  if (!code) return false;
  const cleanCode = code.toUpperCase();
  if (cleanCode.length !== CODE_LENGTH) return false;
  return cleanCode.split('').every(char => CHARACTERS.includes(char));
};

export default generateRoomCode;