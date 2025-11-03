import type { Recipe } from '../types.ts';

export const translations = {
  en: {
    languageName: "English",
    header: {
      title: "Culinary Alchemist",
      startOver: "Start Over",
    },
    error: {
      title: "Oops!",
      ingredientAnalysisFailed: "Failed to analyze ingredients. Please try another image.",
      recipeGenerationFailed: "Could not generate a valid recipe.",
      imageGenerationFailed: "Image generation failed. Please try again.",
      genericError: "Something went wrong during visualization.",
      invalidImage: "Please upload a valid image file.",
      sessionStartFailed: "Could not start the cooking session. Please check permissions and try again.",
    },
    languageSelector: {
      title: "Choose Your Language",
    },
    imageUploader: {
      title: "What's in Your Kitchen?",
      subtitle: "Upload a photo of your ingredients and let the magic begin.",
      uploadArea: "Click or drag to upload an image",
      button: "Unleash the Alchemist",
      loading: "Analyzing...",
    },
    recipeSuggestions: {
      title: "Here Are Some Ideas!",
      subtitle: "Based on your ingredients, the Alchemist suggests...",
      selectButton: "Cook This",
    },
    recipeDisplay: {
      calories: "kcal (approx.)",
      ingredients: "Ingredients",
      instructions: "Instructions",
      visualizeButton: "Visualize the Dish",
    },
    imageGenerator: {
      loadingMessages: [
        "Summoning culinary spirits...",
        "Painting with pixels...",
        "Plating your visual masterpiece...",
        "The alchemist is at work...",
        "Distilling the essence of flavor...",
      ],
      tryAgainButton: "Try Again",
    },
    imageReady: {
      title: "Your Dish, Visualized!",
      subtitle: "Behold the culinary creation you're about to make.",
      cookAnotherButton: "Cook Another Dish",
    },
    cookingAssistant: {
        title: "Live Cooking Assistant",
        finishButton: "Finish Cooking",
        startButton: "Start Assistant",
        endButton: "End Session",
        ingredientsChecklist: "Ingredients Checklist"
    },
    prompts: {
      analyzeIngredients: "Identify the primary culinary ingredients in this image. Return a simple comma-separated list of the ingredients. For example: 'Tomatoes, Onions, Garlic'.",
      generateRecipe: (ingredients: string[]) => `Based on these ingredients: ${ingredients.join(', ')}, generate up to 5 diverse recipe ideas. For each recipe, provide a title, a short description, a list of ingredients (using only the provided ones plus common pantry staples), step-by-step instructions, and an estimated total calorie count. Respond as a JSON object with a single key "recipes" which holds an array of these recipe objects. All text should be in English.`,
      generateImage: (title: string) => `A hyper-realistic, cinematic, appetizing photo of a finished dish: ${title}. Professional food photography, dramatic lighting.`,
      cookingAssistantSystem: (recipe: Recipe) => `You are a friendly, hands-free cooking assistant called 'Culinary Alchemist'. Guide the user through making the recipe: "${recipe.title}". You will receive a live audio and video stream of their cooking process. Your goal is to help them follow the steps, answer their questions, and keep track of their ingredients using the 'updateIngredientStatus' function. Be encouraging and clear in your instructions. The recipe steps are: ${recipe.steps.join('. ')}. The ingredients are: ${recipe.ingredients.join(', ')}. Start by greeting the user and asking if they are ready to begin with the first step.`,
    }
  },
  fa: {
    languageName: "فارسی",
    header: {
      title: "کیمیاگر آشپزی",
      startOver: "شروع مجدد",
    },
    error: {
      title: "خطا!",
      ingredientAnalysisFailed: "تحلیل مواد اولیه ناموفق بود. لطفاً عکس دیگری را امتحان کنید.",
      recipeGenerationFailed: "دستور پخت معتبری ایجاد نشد.",
      imageGenerationFailed: "ایجاد تصویر ناموفق بود. لطفاً دوباره تلاش کنید.",
      genericError: "در حین تصویرسازی مشکلی پیش آمد.",
      invalidImage: "لطفاً یک فایل تصویر معتبر بارگذاری کنید.",
      sessionStartFailed: "امکان شروع جلسه آشپزی وجود ندارد. لطفاً دسترسی‌ها را بررسی کرده و دوباره تلاش کنید.",
    },
    languageSelector: {
        title: "زبان خود را انتخاب کنید",
    },
    imageUploader: {
      title: "در آشپزخانه شما چه خبر است؟",
      subtitle: "عکسی از مواد اولیه خود آپلود کنید و جادو را شروع کنید.",
      uploadArea: "برای آپلود، کلیک کنید یا عکس را بکشید",
      button: "شروع کن",
      loading: "در حال تحلیل...",
    },
    recipeSuggestions: {
      title: "چند ایده برای شما!",
      subtitle: "بر اساس مواد اولیه‌ای که دارید، کیمیاگر پیشنهاد می‌کند...",
      selectButton: "اینو بپز",
    },
    recipeDisplay: {
      calories: "کیلوکالری (تقریبی)",
      ingredients: "مواد لازم",
      instructions: "دستور پخت",
      visualizeButton: "تصویرسازی غذا",
    },
    imageGenerator: {
      loadingMessages: [
        "احضار ارواح آشپزی...",
        "نقاشی با پیکسل‌ها...",
        "چیدن شاهکار بصری شما...",
        "کیمیاگر مشغول کار است...",
        "تقطیر جوهره طعم...",
      ],
      tryAgainButton: "تلاش مجدد",
    },
    imageReady: {
      title: "غذای شما، به تصویر کشیده شد!",
      subtitle: "شاهکار آشپزی که در شرف ساخت آن هستید را ببینید.",
      cookAnotherButton: "پختن یک غذای دیگر",
    },
    cookingAssistant: {
        title: "دستیار آشپزی زنده",
        finishButton: "پایان پخت",
        startButton: "شروع دستیار",
        endButton: "پایان جلسه",
        ingredientsChecklist: "چک‌لیست مواد اولیه"
    },
    prompts: {
        analyzeIngredients: "مواد اولیه اصلی آشپزی در این تصویر را شناسایی کن. یک لیست ساده از مواد با کاما جدا شده برگردان. مثال: 'گوجه, پیاز, سیر'. پاسخ باید به فارسی باشد.",
        generateRecipe: (ingredients: string[]) => `بر اساس این مواد اولیه: ${ingredients.join(', ')}، حداکثر ۵ ایده متنوع برای دستور پخت ارائه بده. برای هر دستور پخت، یک عنوان، توضیحات کوتاه، لیست مواد لازم (فقط با استفاده از مواد ارائه شده به علاوه مواد اصلی رایج در آشپزخانه)، دستورالعمل‌های گام به گام و کالری تخمینی کل غذا را ارائه بده. پاسخ را به صورت یک شیء JSON با یک کلید واحد "recipes" که آرایه‌ای از این اشیاء دستور پخت است، برگردان. تمام متون باید به زبان فارسی باشد.`,
        generateImage: (title: string) => `یک عکس هایپررئال، سینمایی و اشتهاآور از یک غذای آماده: ${title}. عکاسی حرفه‌ای غذا، نورپردازی دراماتیک.`,
        cookingAssistantSystem: (recipe: Recipe) => `تو یک دستیار آشپزی صوتی و تصویری دوستانه به نام «کیمیاگر آشپزی» هستی. کاربر را در پختن این دستور غذا راهنمایی کن: «${recipe.title}». تو یک جریان صوتی و تصویری زنده از فرآیند آشپزی کاربر دریافت می‌کنی. هدف تو کمک به کاربر برای دنبال کردن مراحل، پاسخ به سوالات، و پیگیری مواد اولیه با استفاده از تابع 'updateIngredientStatus' است. در دستورالعمل‌هایت واضح و دلگرم‌کننده باش. مراحل دستور پخت عبارتند از: ${recipe.steps.join('. ')}. مواد اولیه عبارتند از: ${recipe.ingredients.join(', ')}. با خوشامدگویی به کاربر شروع کن و بپرس آیا برای شروع مرحله اول آماده است.`,
    }
  },
};

export type Language = keyof typeof translations;
export type Translation = typeof translations[Language];