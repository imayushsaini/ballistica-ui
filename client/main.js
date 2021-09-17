function urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
    
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }
    
    const publicVapidKey = 'BLHl0OcSwB9pL9Yfi-tMa0pJMbWBO_OpkG-8QKQQqWb08cunEihuHgvvGzKYB6mU0w_RgqKtTJH8l3yCwGXWFaw';
    
    const triggerPush = document.querySelector('.trigger-push');
    
    async function triggerPushNotification() {
      if ('serviceWorker' in navigator) {
        const register = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
    
        const subscription = await register.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });
        console.log("sending post request")
        msg={'subscription':subscription,'player_id':'pb-678'}
        await fetch('/subscribe', {
          method: 'POST',
          body: JSON.stringify(msg),
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } else {
        console.error('Service workers are not supported in this browser');
      }
    }
    
    triggerPush.addEventListener('click', () => {
      triggerPushNotification().catch(error => console.error(error));
    });