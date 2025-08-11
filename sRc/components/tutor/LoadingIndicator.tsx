
export const LoadingIndicator = () => {
    return (
      <div className="flex justify-start animate-slide-in-up">
        <div className="glass-effect rounded-2xl rounded-bl-sm px-6 py-4 shadow-lg max-w-xs">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-muted-foreground font-medium">AI is thinking...</span>
          </div>
        </div>
      </div>
    );
  };
  