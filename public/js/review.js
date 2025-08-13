document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.like-btn').forEach(button => {
    button.addEventListener('click', () => {
      const reviewId = button.dataset.id;

      fetch(`/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            document.getElementById(`likes-${reviewId}`).textContent = data.likes;
          } else {
            alert('Failed to like review');
          }
        })
        .catch(err => {
          console.error('Error liking review:', err);
        });
    });
  });
});