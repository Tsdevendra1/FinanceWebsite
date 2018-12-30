from django.contrib.auth.views import LoginView, LogoutView
from django.urls import path, reverse_lazy
from django.contrib.auth import login
from main import views as m_views

urlpatterns = [
    path('home/', m_views.HomeView.as_view(), name='home'),
    path('sentiment/', m_views.GenericTemplateView.as_view(template_name='main/sentiment_page.html'),
         name='sentiment'),
    path('login/', LoginView.as_view(template_name='main/login.html', success_url=reverse_lazy('home')),
         name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('signup/', m_views.SignupView.as_view(), name='signup'),
    path('portfolio/', m_views.PortfolioView.as_view(), name='portfolio'),
    path('save/', m_views.UpdateProfileTickersView.as_view(), name='profile-tickers'),
    path('api/data/', m_views.GetSentimentDataView.as_view(), name='sentiment-data'),
    path('api/tickers/', m_views.GetTickersApi.as_view(), name='database-tickers'),
]
