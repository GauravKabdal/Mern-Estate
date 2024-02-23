import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import profileBg from "../assets/profile_background.jpg";

const Profile = () => {
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  return (
    <div className="bg-cover bg-center bg-no-repeat bg-[url('./assets/profile_background.jpg')]">
      <div className="flex flex-col p-3 max-w-lg mx-auto ">
        <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
        <form className="flex flex-col gap-4">
          <input
            type="file"
            name=""
            id=""
            ref={fileRef}
            hidden
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <img
            onClick={() => fileRef.current.click()}
            src={formData.avatar || currentUser.avatar}
            alt=""
            className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
          />
          <p className="text-sm self-center">
            {fileUploadError ? (
              <span className="text-red-700">
                Error uploading Image(image should be less than 2MB)
              </span>
            ) : filePerc > 0 && filePerc < 100 ? (
              <span className="text-slate-700">{`Uploading ${filePerc} %`}</span>
            ) : filePerc == 100 ? (
              <span className="text-green-700">Uploaded Successfully</span>
            ) : (
              " "
            )}
          </p>
          <input
            type="text"
            placeholder="username"
            className="border p-3 rounded-lg"
            id="username"
          />
          <input
            type="text"
            placeholder="email"
            className="border p-3 rounded-lg"
            id="email"
          />
          <input
            type="text"
            placeholder="password"
            className="border p-3 rounded-lg"
            id="password"
          />
          <button className="transition ease-in duration-500 bg-slate-700 font-bold text-white rounded-lg p-3 uppercase hover:text-slate-700 hover:bg-slate-300 disabled:opacity-70">
            Update
          </button>
          <div className="flex justify-between mt-1">
            <span className="transition ease-in duration-500 text-red-700 cursor-pointer bg-white rounded p-3 font-bold hover:bg-red-700 hover:text-white">
              Delete Account
            </span>
            <span className="transition ease-in duration-500 text-red-700 cursor-pointer  bg-white rounded p-3 font-bold hover:bg-red-700 hover:text-white">
              Sign Out
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
