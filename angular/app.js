var app = angular.module('bookshelf',['ngRoute']);

app.service('PanelService',[function()
{
     //set default as subjects set panel to subjects
    this.panel = '';
    this.isActive = function(panel)
    {
        return this.panel == panel;  
    };
    
    this.setActive = function(clickedPanel)
    {
        return this.panel = clickedPanel;
    };
    
}]);


app.controller('RootController',['$http','PanelService',function($http, PanelService)
{
     this.isActive = function(panel)
    {
        return PanelService.isActive(panel);  
    };
    
    this.setActive = function(clickedPanel)
    {
        PanelService.setActive(clickedPanel);  
    };
    PanelService.setActive('login');
    
   
}]);

app.service('TokenService', ['$rootScope',function($rootScope)
{
    this.token = '';
    this.setToken = function(token)
    {
        this.token = token;
        $rootScope.$broadcast('tokenSet');
    };
    this.getToken = function()
    {
        return this.token;
    };
    this.getConfig = function()
    {
        return {headers:{'X-Bearer-Token':this.token}};
    }; 
}]);

app.controller('LoginController',['$http','PanelService','TokenService',function($http,PanelService,TokenService)
{
    this.user={};
    this.error = '';
    
    var store = this;
    
    this.authenticate = function()
    {
        $http.post('http://localhost:8888/bookshelf/api.php/tokens', store.user).success(function(data)
        {
            if (data.token != null)
            {
                TokenService.setToken(data.token);
                
                PanelService.setActive('books')
            }else
            {
                store.error = "Invalid email or password"
            }
        }).error(function(data)
        {
            store.error = data;
        });  
    }
}]);

app.service('BooksService',['$http','TokenService', function($http,TokenService)
{
    this.getBooks = function()
    {
        return  $http.get('http://localhost:8888/bookshelf/api.php/books', TokenService.getConfig());
    };
    
    
    this.getBook = function(bookId)
    {
        return  $http.get('http://localhost:8888/bookshelf/api.php/books/' + bookId, TokenService.getConfig());
    };
}]);

app.controller ('BooksController',['$scope','BooksService','PanelService', '$rootScope',function($scope,BooksService, PanelService, $rootScope)
    {
        var store = this;
        
        $scope.$on('tokenSet',function()
        {
        BooksService.getBooks().success(function(data)
        
             {
             //do something with retured data
             store.books = data;
             console.log(data);
            }); 

            
        
        });

        //function to call switch button of books
        this.switchToBook = function(bookId)
        {
            BooksService.getBook(bookId).success(function(data)
            {
                $rootScope.$broadcast("newBook", data);
            });
            PanelService.setActive("singleBook");
        }
   }]);

app.controller ('SingleBookController' ['$scope','BooksService',function($scope,BooksService)
    {

        var store = this;

        
        $scope.$on('newBook',function(event, book)
        {
             //store as book
             store.book = book;
             console.log(store.book);
            
        
        });

    }]);


