import { useState } from "react";
import axios from "axios";

export default function Clothing() {
  const [clothingChoice, setClothingChoice] = useState("jacket");
  const [newStyle, setNewStyle] = useState("");
  const [imageUrl, setImageUrl] = useState("/album.jpg"); // The initial album art image
  const [modifiedImage, setModifiedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClothingChange = async () => {
    setLoading(true);
    try {
      const prompt = `Replace the ${clothingChoice} with a ${newStyle}`;
      const response = await axios.post("/api/openai", {
        prompt: prompt,
      });

      setModifiedImage(response.data.imageUrl);
    } catch (error) {
      console.error("Error modifying clothing:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <h1>Customize Album Art Clothing</h1>
      <img src={imageUrl} alt="Album Art" width={300} />
      <div>
        <h3>Choose a Clothing Element to Modify</h3>
        <select
          value={clothingChoice}
          onChange={(e) => setClothingChoice(e.target.value)}
        >
          <option value="jacket">Jacket</option>
          <option value="pants">Pants</option>
        </select>

        <h3>Select a New Style</h3>
        <input
          type="text"
          value={newStyle}
          onChange={(e) => setNewStyle(e.target.value)}
          placeholder="e.g. red leather jacket"
        />
        <button onClick={handleClothingChange} disabled={loading}>
          {loading ? "Processing..." : "Apply Change"}
        </button>
      </div>

      {modifiedImage && (
        <div>
          <h3>Modified Image</h3>
          <img src={modifiedImage} alt="Modified Album Art" width={300} />
        </div>
      )}
    </div>
  );
}
