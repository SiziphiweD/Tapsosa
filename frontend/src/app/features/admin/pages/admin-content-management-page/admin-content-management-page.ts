import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type PageDoc = { title: string; content: string };
type Post = { id: string; title: string; content: string; category: string; published: boolean; createdAt: string };
type Announcement = { id: string; title: string; message: string; scheduledAt?: string };

@Component({
  selector: 'app-admin-content-management-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-content-management-page.html',
  styleUrl: './admin-content-management-page.css',
})
export class AdminContentManagementPage {
  pages: Record<string, PageDoc> = {
    about: { title: 'About Us', content: '' },
    'how-it-works': { title: 'How It Works', content: '' },
    pricing: { title: 'Pricing', content: '' },
    terms: { title: 'Terms of Service', content: '' },
    privacy: { title: 'Privacy Policy', content: '' },
  };
  currentPageKey = 'about';
  posts: Post[] = [];
  categories: string[] = ['News', 'Updates'];
  newPost: Partial<Post> = { title: '', content: '', category: 'News', published: false };
  announcements: Announcement[] = [];
  newAnnouncement: Partial<Announcement> = { title: '', message: '' };
  saved = false;

  constructor() {
    this.load();
  }

  savePage() {
    localStorage.setItem('tapsosa.cms.pages', JSON.stringify(this.pages));
    this.toast();
    this.log('Saved page ' + this.currentPageKey);
  }

  addPost() {
    if (!this.newPost.title || !this.newPost.content) return;
    const p: Post = {
      id: 'post-' + Date.now(),
      title: this.newPost.title!,
      content: this.newPost.content!,
      category: this.newPost.category || 'News',
      published: !!this.newPost.published,
      createdAt: new Date().toISOString(),
    };
    this.posts = [p, ...this.posts];
    this.newPost = { title: '', content: '', category: 'News', published: false };
    this.savePosts();
    this.log('Added post');
  }

  togglePublish(id: string) {
    this.posts = this.posts.map((p) => (p.id === id ? { ...p, published: !p.published } : p));
    this.savePosts();
    this.log('Toggled publish');
  }

  removePost(id: string) {
    this.posts = this.posts.filter((p) => p.id !== id);
    this.savePosts();
    this.log('Removed post');
  }

  addCategory(name: string) {
    const v = name.trim();
    if (!v) return;
    if (!this.categories.includes(v)) {
      this.categories.push(v);
      localStorage.setItem('tapsosa.cms.categories', JSON.stringify(this.categories));
      this.log('Added blog category');
    }
  }

  addAnnouncement() {
    if (!this.newAnnouncement.title || !this.newAnnouncement.message) return;
    const a: Announcement = {
      id: 'ann-' + Date.now(),
      title: this.newAnnouncement.title!,
      message: this.newAnnouncement.message!,
      scheduledAt: this.newAnnouncement.scheduledAt,
    };
    this.announcements = [a, ...this.announcements];
    localStorage.setItem('tapsosa.cms.announcements', JSON.stringify(this.announcements));
    this.newAnnouncement = { title: '', message: '' };
    this.toast();
    this.log('Added announcement');
  }

  private savePosts() {
    localStorage.setItem('tapsosa.cms.posts', JSON.stringify(this.posts));
  }

  private load() {
    try {
      const p = localStorage.getItem('tapsosa.cms.pages');
      if (p) this.pages = JSON.parse(p);
      const posts = localStorage.getItem('tapsosa.cms.posts');
      if (posts) this.posts = JSON.parse(posts);
      const cats = localStorage.getItem('tapsosa.cms.categories');
      if (cats) this.categories = JSON.parse(cats);
      const anns = localStorage.getItem('tapsosa.cms.announcements');
      if (anns) this.announcements = JSON.parse(anns);
    } catch {}
  }

  private toast() {
    this.saved = true;
    setTimeout(() => (this.saved = false), 1500);
  }

  private log(action: string) {
    try {
      const raw = localStorage.getItem('tapsosa.admin.logs');
      const logs = raw ? JSON.parse(raw) : [];
      logs.unshift({ id: 'log-' + Date.now(), action, page: 'Content Management', timestamp: new Date().toISOString() });
      localStorage.setItem('tapsosa.admin.logs', JSON.stringify(logs.slice(0, 200)));
    } catch {}
  }
}
