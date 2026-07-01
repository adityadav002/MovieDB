import "../style/FaqStyle.css";

function FAQ() {
  const FAQ = [
    {
      question: "What is MovieDB?",
      answer:
        "MovieDB is your personalized movie space where you can explore top-rated films, save favorites, build your watchlist, and keep track of what you love — all in one place.",
    },
    {
      question: "Do I need an account to use MovieDB?",
      answer:
        "Yes, you'll need to create a free account to unlock features like favoriting movies, adding to your watchlist, and accessing your custom dashboard.",
    },
    {
      question: "What is the Watchlist?",
      answer:
        "The Watchlist lets you bookmark movies or shows you want to watch later. It's your personal queue — come back anytime and pick up where you left off.",
    },
    {
      question: "How do I add a movie to my Favorites?",
      answer:
        "Click the heart icon or 'Add to Favorites' button on any movie detail page to save it to your personal Favorites list.",
    },
    {
      question: "Can I remove movies from my Watchlist or Favorites?",
      answer:
        "Absolutely. Just head to your Watchlist or Favorites page and click the remove icon next to any movie to update your lists.",
    },
    {
      question: "Is MovieDB free to use?",
      answer:
        "Yes, MovieDB is completely free. You just need to sign up to start creating your own personalized movie collection.",
    },
    {
      question: "How often is movie data updated?",
      answer:
        "We pull the latest movie data from trusted APIs to keep listings, ratings, posters, and details up to date regularly.",
    },
    {
      question: "Is this like Netflix or a streaming service?",
      answer:
        "MovieDB is not a streaming platform. Think of it as your own movie library companion — track what you love, plan what to watch, and discover new favorites.",
    },
    {
      question: "How do I search for movies?",
      answer:
        "Use the search bar at the top of the page to instantly find movies by title, genre, or keywords. Hit 'Enter' to see results.",
    },
  ];
  return (
    <>
      <div className="faq-container">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        {FAQ.map((item, index) => (
          <details key={index} className="faq-item">
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </>
  );
}

export default FAQ;
