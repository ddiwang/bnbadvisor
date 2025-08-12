document.addEventListener('DOMContentLoaded', () => {
  const likeButtons = document.querySelectorAll('.like-btn');

  likeButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const reviewId = btn.dataset.id;

      try {
        const res = await fetch(`/reviews/${reviewId}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();

        if (data.success) {
          const likesCountElem = btn.querySelector('.likes-count');
          likesCountElem.textContent = data.likes;
        } else {
          alert('Failed to like this review.');
        }
      } catch (err) {
        console.error(err);
        alert('Error liking review.');
      }
    });
  });
});