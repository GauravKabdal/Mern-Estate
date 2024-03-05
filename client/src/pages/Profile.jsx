import { useSelector, useDispatch } from "react-redux";
import { useRef, useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { app } from "../firebase";

import {
  updateUserStart,
  updateUserFailure,
  updateUserSuccess,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signoutUserStart,
  signoutUserFailure,
  signoutUserSuccess,
} from "../redux/user/userSlice";

import { Link } from "react-router-dom";

const Profile = () => {
  const dispatch = useDispatch();
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [updateSuccess, setUpdateSuccess] = useState(false);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    console.log(formData);
  };

  const handleSubmit = async (e) => {
    console.log("handle Submit reached !");
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      console.log("reached update start");
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log(res);
      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        console.log("reached data update failure!");
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());

      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });

      const data = res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }

      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure());
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signoutUserStart());
      const res = await fetch("/api/auth/signout");
      const data = res.json();
      dispatch(signoutUserSuccess(data));
      if (data.success === false) {
        dispatch(signoutUserFailure(data.message));
        return;
      }
    } catch (error) {
      dispatch(signoutUserFailure(error.message));
    }
  };

  return (
    <div className="bg-cover bg-center bg-no-repeat bg-[url('./assets/profile_background.jpg')]">
      <div className="flex flex-col p-3 max-w-lg mx-auto ">
        <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            alt="Profile Photo"
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
            defaultValue={currentUser.username}
            className="border p-3 rounded-lg"
            id="username"
            onChange={handleChange}
          />
          <input
            type="text"
            defaultValue={currentUser.email}
            placeholder="email"
            className="border p-3 rounded-lg"
            id="email"
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="password"
            className="border p-3 rounded-lg"
            id="password"
          />
          <button
            disabled={loading}
            className="transition ease-in duration-500 bg-slate-700 font-bold text-white rounded-lg p-3 uppercase hover:text-slate-700 hover:bg-slate-300 disabled:opacity-70"
          >
            {loading ? "Loading..." : "Update"}
          </button>
          <Link
            className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:bg-white hover:text-green-700 font-medium transition duration-500 ease-in"
            to={"/create-listing"}
          >
            Create Listing
          </Link>
        </form>
        <div className="flex justify-between mt-2">
          <span
            onClick={handleDeleteUser}
            className="transition ease-in duration-500 text-red-700 cursor-pointer bg-white rounded p-3 font-bold hover:bg-red-700 hover:text-white"
          >
            Delete Account
          </span>
          <span
            onClick={handleSignOut}
            className="transition ease-in duration-500 text-red-700 cursor-pointer  bg-white rounded p-3 font-bold hover:bg-red-700 hover:text-white"
          >
            Sign Out
          </span>
        </div>
        {error && <p className="text-red-700 mt-3">{error}</p>}
        {updateSuccess && (
          <p className="text-green-700">Updated Successfully!!</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
