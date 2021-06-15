import * as model from './model.js';
import recipeView from './views/recipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import PageinationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';
// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////



const controlRecipe = async function(){
  try {
    const id = window.location.hash.slice(1);
    if(!id) return;
    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks)
    await model.loadRecipe(id);
    recipeView.render(model.state.recipe);
   

  } catch (error) {
    recipeView.renderError("Can't find the recipe");
  }
}


const controlSearchResults = async function(){
  try {
    resultsView.renderSpinner();
    const query = searchView.getQuery();

    if(!query) return;

    await model.loadSearchResults(query);
    resultsView.render(model.getSearchResultsPage());

    PageinationView.render(model.state.search);

  } catch (error) {
    recipeView.renderError("Can't");
  }
}


const controlPagination = function(goToPage){
  resultsView.render(model.getSearchResultsPage(goToPage));
  PageinationView.render(model.state.search);
}


const controlServings = function(newServings){
  model.updateServings(newServings);

  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe)
}

const controlAddBookMark = function(){
  if(!model.state.recipe.bookmark){
    model.addBookMark(model.state.recipe);
  }
  else if(model.state.recipe.bookmark){
    model.deleteBookMark(model.state.recipe.id)
  }

  
  recipeView.update(model.state.recipe);
 
  bookmarksView.render(model.state.bookmarks);
}

const controlBookMarks = function(){
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function(newRecipe){
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
}

const init = function(){
  bookmarksView.addHandlerRender(controlBookMarks)
  recipeView.addhandleRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandleAddBookMark(controlAddBookMark);
  searchView.addHandleSearch(controlSearchResults);
  PageinationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe)
};

init();

