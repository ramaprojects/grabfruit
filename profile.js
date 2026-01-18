// ================= PROFILE MODAL =================

const profileModal = document.getElementById("profile-modal");
const closeProfileBtn = document.querySelector(".close-profile");
const profileNameInput = document.querySelector(".profile-name");

// open modal
function openProfileModal() {
  profileModal.classList.add("active");
  loadProfile();
}

// close modal
function closeProfileModal() {
  profileModal.classList.remove("active");
}

// load profile data
function loadProfile() {
  const savedName = localStorage.getItem("profileName");
  if (savedName) {
    profileNameInput.value = savedName;
  }
}

// save name
profileNameInput.addEventListener("input", () => {
  localStorage.setItem("profileName", profileNameInput.value);
});

closeProfileBtn.addEventListener("click", closeProfileModal);
document
  .querySelector(".profile-overlay")
  .addEventListener("click", closeProfileModal);
