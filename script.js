async function getInfo() {
  document.getElementById('step3').classList.add('hidden');
  document.getElementById('result').classList.remove('hidden');

  // IP Info
  let ipData = await fetch('https://ipinfo.io/json?token=YOUR_TOKEN_HERE')
    .then(res => res.json());

  // Device info
  let device = navigator.userAgent;

  // Location from browser (if granted)
  navigator.geolocation.getCurrentPosition((pos) => {
    let coords = `${pos.coords.latitude}, ${pos.coords.longitude}`;

    document.getElementById('details').innerText =
      `Name: ${document.getElementById('name').value}
       \nLocation (GPS): ${coords}
       \nIP-Based City: ${ipData.city}, ${ipData.region}
       \nDevice Info: ${device}`;
  }, () => {
    document.getElementById('details').innerText =
      `Name: ${document.getElementById('name').value}
       \nLocation: Not granted
       \nIP-Based City: ${ipData.city}, ${ipData.region}
       \nDevice Info: ${device}`;
  });

  // Camera Access
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      document.getElementById('video').srcObject = stream;
    });
}

function stepTwo() {
  document.getElementById('quiz').classList.add('hidden');
  document.getElementById('step2').classList.remove('hidden');
}

function stepThree() {
  document.getElementById('step2').classList.add('hidden');
  document.getElementById('step3').classList.remove('hidden');
}
