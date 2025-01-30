document.addEventListener("DOMContentLoaded", function () {
    fetch('/playlists')
        .then(response => response.json())
        .then(data => {
            const playlistsContainer = document.getElementById('playlists');
            if (data.items && data.items.length > 0) {
                data.items.forEach(playlist => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<a href="${playlist.external_urls.spotify}" target="_blank">${playlist.name}</a>`;
                    playlistsContainer.appendChild(listItem);
                });
            } else {
                playlistsContainer.innerHTML = '<p>No playlists found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching playlists:', error);
        });
});
