from django.contrib.auth.forms import UserCreationForm
import json
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.urls import reverse_lazy
from django.views import View
from django.views.generic import TemplateView, FormView, CreateView, ListView, UpdateView, DeleteView, DetailView
import praw

# Create your views here.
from django_common.auth_backends import User

from main.models import Ticker, Profile
from main.save_sp500 import create_tickers_in_database


class HomeView(LoginRequiredMixin, TemplateView):
    template_name = 'main/home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        profile_tickers = []
        user_profile = Profile.objects.get(user=self.request.user)
        for ticker in user_profile.tickers.all():
            profile_tickers.append((ticker.company, ticker.ticker_symbol))
        context['profile_tickers'] = profile_tickers
        return context


class GenericTemplateView(LoginRequiredMixin, TemplateView):
    template_name = 'main/sentiment_page.html'


class PortfolioView(LoginRequiredMixin, TemplateView):
    template_name = 'main/portfolio.html'


class SignupView(CreateView):
    template_name = 'main/signup.html'
    form_class = UserCreationForm
    success_url = reverse_lazy('login')

    def form_valid(self, form):
        user = form.save()
        user.refresh_from_db()  # load the profile instance created by the signal
        print(user.profile)
        user.save()
        return super().form_valid(form)


class GetTickersApi(View):

    def get(self, request, *args, **kwargs):
        tickers = Ticker.objects.all()
        companies = []
        company_ticker = {}
        for ticker in tickers:
            companies.append(ticker.company)
            company_ticker[ticker.company] = ticker.ticker_symbol

        data = {
            "companies": companies,
            "company_tickers": company_ticker

        }
        return JsonResponse(data)


class UpdateProfileTickersView(LoginRequiredMixin, View):
    template_name = 'main/portfolio.html'
    model = User

    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            body_unicode = request.body.decode('utf-8')
            body = json.loads(body_unicode)
            user_profile = Profile.objects.get(user=self.request.user)
            # Delete all the current relations ones so we can replace it with what has been posted
            user_profile.tickers.clear()
            # Add the new tickers to the profile
            for ticker in body['tickers']:
                ticker_object = Ticker.objects.get(ticker_symbol=ticker)
                user_profile.tickers.add(ticker_object)


class GetSentimentDataView(View):

    def get(self, request, *args, **kwargs):
        data = {
            "scores": [-11],
            "months": ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        }
        return JsonResponse(data)
