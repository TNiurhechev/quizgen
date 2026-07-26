import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { CreateDeck } from './pages/create-deck/create-deck';
import { DeckView } from './pages/deck-view/deck-view';
import { VerifyEmail } from './pages/verify-email/verify-email';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'register', component: Register},
    { path: 'verify-email', component: VerifyEmail},
    { path: 'forgot-password', component: ForgotPassword},
    { path: 'create', component: CreateDeck, canActivate: [authGuard]},
    { path: 'deck/:id', component: DeckView, canActivate: [authGuard]},
    { path: '', component: Dashboard, canActivate: [authGuard]},
    { path: '**', redirectTo: ''}
];
