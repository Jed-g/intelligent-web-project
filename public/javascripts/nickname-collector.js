if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");

  window.addEventListener("online", () => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active.postMessage("online");
    });
  });

  navigator.serviceWorker.addEventListener("message", (e) => {
    if (e.data === "reload") {
      window.location.reload();
    }
  });
}

const getNickname = () => {
  return new Promise((resolve, reject) => {
    const dbOpenRequest = window.indexedDB.open("birdWatcher");

    dbOpenRequest.onupgradeneeded = () => {
      const db = dbOpenRequest.result;

      if (!db.objectStoreNames.contains("nickname")) {
        db.createObjectStore("nickname", { keyPath: "nickname" });
      }

      if (!db.objectStoreNames.contains("syncWhenOnline")) {
        db.createObjectStore("syncWhenOnline", { autoIncrement: true });
      }
    };

    dbOpenRequest.onsuccess = () => {
      const db = dbOpenRequest.result;
      const transaction = db.transaction("nickname", "readwrite");
      const store = transaction.objectStore("nickname");
      const request = store.getAll();

      request.onsuccess = () => {
        if (request.result.length < 1) {
          reject();
        } else {
          resolve(request.result[0].nickname);
        }
        db.close();
      };
    };
  });
};

const setNickname = (newNickname) => {
  return new Promise((resolve) => {
    const dbOpenRequest = window.indexedDB.open("birdWatcher");

    dbOpenRequest.onupgradeneeded = () => {
      const db = dbOpenRequest.result;

      if (!db.objectStoreNames.contains("nickname")) {
        db.createObjectStore("nickname", { keyPath: "nickname" });
      }

      if (!db.objectStoreNames.contains("syncWhenOnline")) {
        db.createObjectStore("syncWhenOnline", { autoIncrement: true });
      }
    };

    dbOpenRequest.onsuccess = () => {
      const db = dbOpenRequest.result;
      const transaction = db.transaction("nickname", "readwrite");
      const store = transaction.objectStore("nickname");
      store.put({ nickname: newNickname });
      transaction.oncomplete = () => {
        resolve();
        db.close();
      };
    };
  });
};

const handleSave = () => {
  const newNickname = $("#nickname-collector input").val();

  if (newNickname.length <= 0) {
    $("#nickname-collector button").css(
      "background-color",
      "rgb(248, 114, 114)"
    );
    $("#nickname-collector button").css("color", "rgb(71, 0, 0)");
  } else {
    $("#nickname-collector").hide();

    setNickname(newNickname);
  }
};

try {
  await getNickname();
} catch (error) {
  $("#nickname-collector").css("display", "flex");

  $("#nickname-collector button").click(handleSave);
  $("#nickname-collector input").keydown((e) => {
    if (e.key === "Enter") {
      handleSave();
      return false;
    }
  });
}

export { getNickname, setNickname };
