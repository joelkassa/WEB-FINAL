
/* config */
const API_KEY = NEWS_API_KEY;
let currentCategory = 'technology';//starting catagory
let currentQuery = '';//search query is empty
let nextPageToken = null;
//function managing the api endpoint
function getEndpoint() {
  const query = currentQuery || currentCategory;
  let url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=en&q=${encodeURIComponent(query)}&size=9`;
  if (nextPageToken) url += `&page=${nextPageToken}`;
  return url;
}

/* state of premium form(the form is open or not) */
let isPremiumFormOpen = false;

/* reference of buttons*/
const premBtn = document.getElementById('premiumBtn');
const premSec = document.getElementById('premiumFormSec');
const closeBtn = document.getElementById('closePremium');
const premForm = document.getElementById('premiumForm');
const successP = document.getElementById('premSuccess');
const allGrid = document.getElementById('allGrid');
const likedGrid = document.getElementById('likedGrid');
const interestCount = document.getElementById('interestCount');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

/* premium form open and close function */
function togglePremiumForm(show) {
  isPremiumFormOpen = show;
  premSec.classList.toggle('hidden', !show);
  premBtn.classList.toggle('active', show);
  premBtn.setAttribute('aria-expanded', show);//tells screen readers the state(open/close)
  
  if (show) {
    premBtn.querySelector('.btn-text').textContent = 'Close Form';
    setTimeout(() => document.getElementById('pName')?.focus(), 100);
  } else {
    premBtn.querySelector('.btn-text').textContent = 'Become a Premium User';
  }
}
//premium form open
premBtn.addEventListener('click', () => {
  togglePremiumForm(!isPremiumFormOpen);
});
//premium form close
closeBtn.addEventListener('click', () => {
  togglePremiumForm(false);
});
//esc key to close premium form
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isPremiumFormOpen) {
    togglePremiumForm(false);
  }
});

/* premium form validation */
premForm.addEventListener('submit', (e) => {
  e.preventDefault();//reload paused for now
  let isValid = true;
  //remove error messages and styles
  premForm.querySelectorAll('.error').forEach(span => span.textContent = '');
  premForm.querySelectorAll('input, select').forEach(field => field.classList.remove('input-error'));
  //validate name
  const name = premForm.pName.value.trim();
  if (!/^[A-Za-z\s]{2,50}$/.test(name)) {
    showFieldError(premForm.pName, 'Letters & spaces only (2-50 chars)');
    isValid = false;
  }
  //validate age
  const age = parseInt(premForm.pAge.value);
  if (isNaN(age) || age < 13 || age > 120) {
    showFieldError(premForm.pAge, 'Valid age 13-120 required');
    isValid = false;
  }
  //validate sex(make shure one is chosen)
  if (!premForm.pSex.value) {
    showFieldError(premForm.pSex, 'Please select an option');
    isValid = false;
  }
  //validate email
  const email = premForm.pEmail.value;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError(premForm.pEmail, 'Valid email required');
    isValid = false;
  }
  //save data, hides the form and show success message
  if (isValid) {
    const data = {
      name,
      age,
      sex: premForm.pSex.value,
      email,
      date: new Date().toISOString()
    };
    localStorage.setItem('premiumUser', 'true');
    localStorage.setItem('premiumData', JSON.stringify(data));
    
    premForm.classList.add('hidden');
    successP.classList.remove('hidden');
    premBtn.textContent = 'Premium Active ✓';
    premBtn.disabled = true;
    premBtn.classList.add('btn-success');
    
    showToast('Premium membership activated!', 'success');
  }
});
//if there is error display the error and highlight the field for few seconds 
function showFieldError(input, message) {
  const errorSpan = input.parentElement.querySelector('.error');
  errorSpan.textContent = message;
  input.classList.add('input-error');
  setTimeout(() => {
    input.classList.remove('input-error');
  }, 3000);
}

/* catagory */

//chosen catagory button active state
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    //update which catagory is chosen and fetch news accordingly
    currentCategory = btn.dataset.cat;
    currentQuery = '';
    nextPageToken = null;
    //search input is voided
    if (searchInput) searchInput.value = '';
    //fetch the news
    fetchNews();
    showToast(`Loading ${currentCategory} news...`);
  });
});

/* search */
//search button and enter key event listeners
if (searchBtn) {
  searchBtn.addEventListener('click', doSearch);
}

if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doSearch();
  });
}
// accept key word and fetch news accordingly
function doSearch() {
  const query = searchInput.value.trim();
  if (!query) return;
  
  currentQuery = query;
  currentCategory = '';
  nextPageToken = null;
  
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  
  fetchNews();
  showToast(`Searching: "${query}"`);
}

/* choose a tab and that tab will be displayed(liked/ all) */
//chosen tab button active state
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;
    //audio feedback for screen readers
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    
    document.querySelectorAll('.tab-content').forEach(c => {
      c.classList.remove('active');
      c.hidden = true;
    });
    const targetContent = document.getElementById(targetTab);
    targetContent.classList.add('active');
    targetContent.hidden = false;
  });
});

/* ===== NEWS FETCHING ===== */
async function fetchNews(append = false) {
  if (!append) {
    showSkeletons();
  }
  //api call
  try {
    const endpoint = getEndpoint();
    const res = await fetch(endpoint);
    const data = await res.json();
    // api error handling
    if (data.status !== 'success') throw new Error(data.message || 'API Error');
    
    nextPageToken = data.nextPage;
    //filter articles with missing title 
    const validArticles = (data.results || []).filter(art => art.title && art.link);
    //show the news or no results message
    if (validArticles.length === 0 && !append) {
      showNoResults();
    } else {
      if (append) {
        appendCards(validArticles);
      } else {
        renderCards(validArticles);
      }
    }
    //fetching load more news
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer) {
      loadMoreContainer.classList.toggle('hidden', !nextPageToken);//no more news to load
    }
  } catch (err) {
    showError(err.message);
  }
}
//create the sceleton cards while loading
function showSkeletons() {
  allGrid.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const div = document.createElement('div');
    div.className = 'skeleton-card';
    allGrid.appendChild(div);
  }
}
//error display function for failed news fetch
function showError(msg) {
  allGrid.innerHTML = `
    <div class="empty-state">
      <p class="text-error mb-1">Failed to load news</p>
      <p class="text-sm mb-1">${msg}</p>
      <button onclick="location.reload()" class="submit-btn">Retry</button>
    </div>
  `;
}
//no results found display function
function showNoResults() {
  allGrid.innerHTML = `
    <div class="empty-state">
      <p>No news found for "${currentQuery || currentCategory}"</p>
      <p class="empty-subtitle">Try a different search term or category</p>
      <button onclick="window.resetNews()" class="submit-btn mt-2">View Technology News</button>
    </div>
  `;
}
//back to default state function
window.resetNews = function() {
  currentQuery = '';
  currentCategory = 'technology';
  nextPageToken = null;
  if (searchInput) searchInput.value = '';
  
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  const techBtn = document.querySelector('[data-cat="technology"]');
  if (techBtn) techBtn.classList.add('active');
  
  fetchNews();
};
//render news cards function
function renderCards(articles) {
  allGrid.innerHTML = '';
  
  const liked = JSON.parse(localStorage.getItem('likedNews') || '[]');
  const likedIds = new Set(liked.map(l => l.id));
  
  articles.forEach((art) => {
    const card = document.createElement('article');
    card.className = 'card';
    
    const isLiked = likedIds.has(art.link);
    
    card.innerHTML = `
      <h3>${escapeHtml(art.title)}</h3>
      <p>${escapeHtml(art.description || 'No description available.')}</p>
      <small>${escapeHtml(art.source_id || 'Unknown')} · ${formatDate(art.pubDate)}</small>
      <div class="card-actions">
        <a href="${art.link}" target="_blank" rel="noopener" class="read-link">Read →</a>
        <button class="interest-btn ${isLiked ? 'liked' : ''}" 
                data-id="${escapeHtml(art.link)}" 
                data-title="${escapeHtml(art.title)}" 
                data-desc="${escapeHtml(art.description || '')}" 
                data-src="${escapeHtml(art.source_id || 'Unknown')}">
          ${isLiked ? 'Saved' : 'Interested'}
        </button>
      </div>
    `;
    allGrid.appendChild(card);
  });
  
  attachInterestListeners();
}
//add more news cards function
function appendCards(articles) {
  const liked = JSON.parse(localStorage.getItem('likedNews') || '[]');
  const likedIds = new Set(liked.map(l => l.id));
  
  articles.forEach((art) => {
    const isLiked = likedIds.has(art.link);
    const card = document.createElement('article');
    card.className = 'card';
    
    card.innerHTML = `
      <h3>${escapeHtml(art.title)}</h3>
      <p>${escapeHtml(art.description || 'No description available.')}</p>
      <small>${escapeHtml(art.source_id || 'Unknown')} · ${formatDate(art.pubDate)}</small>
      <div class="card-actions">
        <a href="${art.link}" target="_blank" rel="noopener" class="read-link">Read →</a>
        <button class="interest-btn ${isLiked ? 'liked' : ''}" 
                data-id="${escapeHtml(art.link)}" 
                data-title="${escapeHtml(art.title)}" 
                data-desc="${escapeHtml(art.description || '')}" 
                data-src="${escapeHtml(art.source_id || 'Unknown')}">
          ${isLiked ? 'Saved' : 'Interested'}
        </button>
      </div>
    `;
    allGrid.appendChild(card);
  });
  
  attachInterestListeners();
}
//prevents malicious code injection(script to normal text)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
//format date to a readable format
function formatDate(dateStr) {
  if (!dateStr) return 'Unknown date';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
}

/* interested */

//reconstruct the saved interests list and manage add/remove
function attachInterestListeners() {
  document.querySelectorAll('.interest-btn').forEach(btn => {
    btn.addEventListener('click', handleInterestClick);
  });
}
//handle add/remove interest button clicks
function handleInterestClick(e) {
  const btn = e.target;
  const isPremium = localStorage.getItem('premiumUser') === 'true';
  const current = JSON.parse(localStorage.getItem('likedNews') || '[]');
  const id = btn.dataset.id;
  //check if already liked
  const existingIndex = current.findIndex(c => c.id === id);
  //remove interest if already liked
  if (existingIndex > -1) {
    current.splice(existingIndex, 1);//remove
    localStorage.setItem('likedNews', JSON.stringify(current));//update
    btn.textContent = 'Interested';
    btn.classList.remove('liked');
    showToast('Removed from interests');
    updateInterestCount();
    renderLiked();
    return;
  }
  //limit for free users
  if (!isPremium && current.length >= 3) {
    showToast('Free users limited to 3 interests. Upgrade to Premium!', 'error');
    premBtn.classList.add('shake');
    setTimeout(() => premBtn.classList.remove('shake'), 500);
    return;
  }
  //add new interest
  current.push({
    id: btn.dataset.id,
    title: btn.dataset.title,
    desc: btn.dataset.desc,
    src: btn.dataset.src,
    date: new Date().toISOString()
  });
  
  localStorage.setItem('likedNews', JSON.stringify(current));//update
  btn.textContent = 'Saved';
  btn.classList.add('liked');
  showToast('Added to your interests');
  updateInterestCount();
  renderLiked();
}
//liked news rendering function
function renderLiked() {
  const list = JSON.parse(localStorage.getItem('likedNews') || '[]');
  likedGrid.innerHTML = '';
  //empty state (how to save interests)
  if (list.length === 0) {
    likedGrid.innerHTML = `
      <div class="empty-state">
        <p>No interests saved yet</p>
        <p class="empty-subtitle">Browse "All News" and click "Interested" to save stories</p>
      </div>
    `;
    updateInterestCount();
    return;
  }
  //list saved interests
  list.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card';
    
    card.innerHTML = `
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.desc || 'No description')}</p>
      <small>${escapeHtml(item.src)} · ${formatDate(item.date)}</small>
      <div class="card-actions">
        <a href="${item.id}" target="_blank" rel="noopener" class="read-link">Read →</a>
        <button class="remove-btn" data-id="${escapeHtml(item.id)}">Remove</button>
      </div>
    `;
    likedGrid.appendChild(card);
  });
  //remove interest button listeners
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const current = JSON.parse(localStorage.getItem('likedNews') || '[]');
      const filtered = current.filter(c => c.id !== id);
      localStorage.setItem('likedNews', JSON.stringify(filtered));
      
      const allBtn = document.querySelector(`.interest-btn[data-id="${id}"]`);
      if (allBtn) {
        allBtn.textContent = 'Interested';
        allBtn.classList.remove('liked');
      }
      
      showToast('Removed from interests');
      renderLiked();
      updateInterestCount();
    });
  });
  
  updateInterestCount();
}

function updateInterestCount() {
  const count = JSON.parse(localStorage.getItem('likedNews') || '[]').length;
  interestCount.textContent = count;
}

/* load more */
document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
  fetchNews(true);
});

/* display messages on the bottom right corner*/
function showToast(message, type = 'success') {
  const container = document.querySelector('.toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  
  container.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/*main function (DOM is document object model - the html is the clueprint and the js file makes it interactive)*/
document.addEventListener('DOMContentLoaded', () => {
  fetchNews();
  renderLiked();
  updateInterestCount();
  
  if (localStorage.getItem('premiumUser') === 'true') {
    premBtn.textContent = 'Premium Active ✓';
    premBtn.disabled = true;
    premBtn.classList.add('btn-success');
  }
});