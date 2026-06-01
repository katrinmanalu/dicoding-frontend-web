const STORAGE_KEY = 'BOOK_APPS_STORAGE';

//Untuk mengambil data buku dari localStorage
function ambilDataBuku(){
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

//Untuk menyimpan semua data buku ke localStorage
function simpanDataBuku(books){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

//Untuk merender ulang semua buku ke rak masing2
function renderUlangBuku(dataFilter = null){
  const daftarBuku = dataFilter !== null ? dataFilter : ambilDataBuku();

  const rakBelumSelesai = document.getElementById('incompleteBookList');
  const rakSelesai = document.getElementById('completeBookList');

  rakBelumSelesai.innerHTML = '';
  rakSelesai.innerHTML = '';

  for (const item of daftarBuku){
    const elemenBuku = buatElemenBuku(item);
    
    if (item.isComplete){
      rakSelesai.appendChild(elemenBuku);
    } else {
      rakBelumSelesai.appendChild(elemenBuku);
    }
  }

  if (rakBelumSelesai.children.length === 0){
    rakBelumSelesai.innerHTML = '<p class="empty-state">Belum ada buku di sini.</p>';
  }
  if (rakSelesai.children.length === 0){
    rakSelesai.innerHTML = '<p class="empty-state">Belum ada buku di sini.</p>';
  }
}

//Untuk membuat elemen buku
function buatElemenBuku(buku){
  const bookItem = document.createElement('div');
  bookItem.setAttribute('data-bookid', buku.id);
  bookItem.setAttribute('data-testid', 'bookItem');

  bookItem.innerHTML = `
    <h3 data-testid="bookItemTitle">${buku.title}</h3>
    <p data-testid="bookItemAuthor">Penulis: ${buku.author}</p>
    <p data-testid="bookItemYear">Tahun: ${buku.year}</p>
    <div class="book-actions">
      <button data-testid="bookItemIsCompleteButton">
        ${buku.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca'}
      </button>
      <button data-testid="bookItemDeleteButton">Hapus buku</button>
      <button data-testid="bookItemEditButton">Edit buku</button>
    </div>
  `;

  //Tombol pindah rak
  const toggleBtn = bookItem.querySelector('[data-testid="bookItemIsCompleteButton"]');
  toggleBtn.addEventListener('click', () => {
    pindahRakBuku(buku.id);
  });

  //Tombol hapus
  const deleteBtn = bookItem.querySelector('[data-testid="bookItemDeleteButton"]');
  deleteBtn.addEventListener('click', () => {
    const yakin = confirm(`Yakin ingin menghapus buku "${buku.title}"?`);
    if (yakin) hapusBuku(buku.id);
  });

  //Tombol edit
  const editBtn = bookItem.querySelector('[data-testid="bookItemEditButton"]');
  editBtn.addEventListener('click', () => {
    bukaModalEdit(buku.id);
  });

  return bookItem;
}

//Untuk tambah buku baru
function tambahBuku(judul, penulis, tahun, selesai){
  const koleksi = ambilDataBuku();
  const bukuBaru = {
    id: +new Date(),
    title: judul,
    author: penulis,
    year: Number(tahun),
    isComplete: selesai,
  };
  koleksi.push(bukuBaru);
  simpanDataBuku(koleksi);
  renderUlangBuku();
}

//Untuk pindah rak
function pindahRakBuku(idBuku){
  const koleksi = ambilDataBuku();
  const index = koleksi.findIndex(b => b.id === idBuku);
  if (index !== -1){
    koleksi[index].isComplete = !koleksi[index].isComplete;
    simpanDataBuku(koleksi);
    renderUlangBuku();
  }
}

//Untuk menghapus buku
function hapusBuku(idBuku){
  let koleksi = ambilDataBuku();
  koleksi = koleksi.filter(b => b.id !== idBuku);
  simpanDataBuku(koleksi);
  renderUlangBuku();
}

//Untuk Fitur Edit Buku
let idEditSekarang = null;

function bukaModalEdit(idBuku){
  const koleksi = ambilDataBuku();
  const buku = koleksi.find(b => b.id === idBuku);
  if (!buku) return;

  idEditSekarang = idBuku;

  document.getElementById('editTitle').value = buku.title;
  document.getElementById('editAuthor').value = buku.author;
  document.getElementById('editYear').value = buku.year;
  document.getElementById('editIsComplete').checked = buku.isComplete;

  document.getElementById('editModal').classList.add('active');
}

function tutupModalEdit(){
  document.getElementById('editModal').classList.remove('active');
  idEditSekarang = null;
}

document.getElementById('closeEditModal').addEventListener('click', tutupModalEdit);

//Untuk tutup modal kalau klik di luar box
document.getElementById('editModal').addEventListener('click', function(e){
  if (e.target === this) tutupModalEdit();
});

//Untuk simpan perubahan edit
document.getElementById('editBookSubmit').addEventListener('click', () => {
  const t = document.getElementById('editTitle').value.trim();
  const a = document.getElementById('editAuthor').value.trim();
  const y = document.getElementById('editYear').value;
  const s = document.getElementById('editIsComplete').checked;

  if (!t || !a || !y){
    alert('Semua field wajib diisi!');
    return;
  }

  const koleksi = ambilDataBuku();
  const index = koleksi.findIndex(b => b.id === idEditSekarang);
  if (index !== -1){
    koleksi[index].title = t;
    koleksi[index].author = a;
    koleksi[index].year = Number(y);
    koleksi[index].isComplete = s;
    simpanDataBuku(koleksi);
    renderUlangBuku();
    tutupModalEdit();
  }
});

//Untuk Form Tambah Buku
const bookForm = document.getElementById('bookForm');
const checkboxIsComplete = document.getElementById('bookFormIsComplete');
const submitButtonSpan = document.querySelector('#bookFormSubmit span');

//Untuk update teks tombol sesuai checkbox
checkboxIsComplete.addEventListener('change', () => {
  submitButtonSpan.textContent = checkboxIsComplete.checked
    ? 'Selesai dibaca'
    : 'Belum selesai dibaca';
});

bookForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('bookFormTitle').value.trim();
  const author = document.getElementById('bookFormAuthor').value.trim();
  const year = document.getElementById('bookFormYear').value;
  const isComplete = checkboxIsComplete.checked;

  tambahBuku(title, author, year, isComplete);

  bookForm.reset();
  submitButtonSpan.textContent = 'Belum selesai dibaca';
});

//Umtuk Fitur Pencarian Buku
const searchForm = document.getElementById('searchBook');

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const keyword = document.getElementById('searchBookTitle').value.trim().toLowerCase();

  if (!keyword){
    renderUlangBuku(); 
    return;
  }

  const data = ambilDataBuku();
  const hasil = data.filter(b => b.title.toLowerCase().includes(keyword));
  renderUlangBuku(hasil);
});

//Untuk reset pencarian kalau input dikosongkan
document.getElementById('searchBookTitle').addEventListener('input', function(){
  if (this.value === '') renderUlangBuku();
});

document.addEventListener('DOMContentLoaded', () => {
  renderUlangBuku();
});