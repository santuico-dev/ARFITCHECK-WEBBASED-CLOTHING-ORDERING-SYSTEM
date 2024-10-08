<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Database;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Kreait\Firebase\Storage;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    protected $database;
    protected $auth;
    protected $storage;

    public function __construct(Database $database)
    {
        $this->database = $database;
        $this->auth = Firebase::auth();
        $this->storage = Firebase::storage();
    }

    //products
    public function fetchProducts($role)
    {
        if ($this->database->getReference('products')->getSnapshot()->exists()) {
            $productData = [];
            if ($role == 'superadmin' || $role == 'admin') {

                foreach ($this->database->getReference('products')->getSnapshot()->getValue() as $productID => $productInfo) {
                    $productData[] = [
                        'productID' => $productID,
                        'productInfo' => $productInfo
                    ];
                }
            } else {

                foreach ($this->database->getReference('products')->getSnapshot()->getValue() as $productID => $productInfo) {
                    if ($productInfo['isVisible'] === true) {
                        $productData[] = [
                            'productID' => $productID,
                            'productInfo' => $productInfo
                        ];
                    }
                }
            }

            return response()->json($productData);
        } else {
            $message = 'No Products Added.';
            return response(compact('message'));
        }
    }

    public function fetchProductByName(Request $request)
    {
        $product = [];
        foreach ($this->database->getReference('products')->getSnapshot()->getValue() as $productID => $productInfo) {
            if ($productInfo['productName'] == $request->productName) {

                $product['uid'] = $productID;
                foreach ($productInfo as $productKey => $productValue) {
                    $product[$productKey] = $productValue;
                }
                return response()->json($product);

                break;
            }
        }
    }

    public function fetchProductByCateg($role, $category)
    {
        if ($this->database->getReference('products')->getSnapshot()->exists()) {
            $productData = [];
            if ($role == 'superadmin' || $role == 'admin') {

                foreach ($this->database->getReference('products')->getSnapshot()->getValue() as $productID => $productInfo) {
                    $productData[] = [
                        'productID' => $productID,
                        'productInfo' => $productInfo
                    ];
                }
            } else {

                foreach ($this->database->getReference('products')->getSnapshot()->getValue() as $productID => $productInfo) {
                    if ($productInfo['isVisible'] === true && $productInfo['productCategory'] === $category) {
                        $productData[] = [
                            'productID' => $productID,
                            'productInfo' => $productInfo
                        ];
                    }
                }
            }

            return response()->json($productData);
        } else {
            $message = 'No Products Added.';
            return response(compact('message'));
        }
    }

    public function fetchProductByID(Request $request)
    {
        $productData = [];

        if ($this->database->getReference('products')->getSnapshot()->exists()) {
            foreach ($this->database->getReference('products')->getSnapshot()->getValue() as $productID => $productInfo) {
                if ($request->productID == $productID) {
                    $productData[] = $productInfo;
                    break;
                }
            }
        }

        return response($productData);
    }

    public function fetchUnlistedProducts()
    {
        $products = [];
        foreach ($this->database->getReference('products')->getSnapshot()->getValue() as $productInfo) {
            if (!$productInfo['isVisible']) {
                $products[] = $productInfo;
            }
        }
        $unlistedPrd = ($products == []) ? "No Product Unlisted" : $products;
        return response()->json($unlistedPrd);
    }

    public function getCriticalLevel() {}

    public function getCategoryCount()
    {

        $totalTShirts = 0;
        $totalShorts = 0;
        $totalCaps = 0;
        $totalHoodies = 0;

        foreach ($this->database->getReference('products')->getSnapshot()->getValue() as $productInfo) {
            if ($productInfo['productCategory'] === 'T-Shirt') {

                $totalTShirts += 1;
            } else if ($productInfo['productCategory'] === 'Shorts') {

                $totalShorts += 1;
            } else if ($productInfo['productCategory'] === 'Hoodies') {

                $totalHoodies += 1;
            } else {

                $totalCaps += 1;
            }
        }

        return response()->json([
            'totalProduct' => $totalTShirts + $totalShorts + $totalCaps + $totalHoodies,
            'totalHoodies' => $totalHoodies,
            'totalShorts' => $totalShorts,
            'totalTShirt' => $totalTShirts,
            'totalCaps' => $totalCaps
        ]);
    }

    // for filtering purposes
    public function getProductByCategory(Request $request)
    {
        $category = '';
        $productByCateg = [];
        $allProduct = [];
        if ($request->category == 'T-shirts') {
            $category = 'T-Shirt';
        } else if ($request->category == 'Hoodies') {
            $category = 'Hoodies';
        } else if ($request->category == 'Shorts') {
            $category = 'Shorts';
        } else if ($request->category == 'Caps') {
            $category = 'Caps';
        }
        //fetch product by its category and return it -josh
        foreach ($this->database->getReference('products')->getSnapshot()->getValue() as $productID => $productInfo) {

            if ($productInfo['productCategory'] == $category) {
                $productByCateg[] = [
                    'productID' => $productID,
                    'productInfo' => $productInfo
                ];
            } else {
                $allProduct[] = [
                    'productID' => $productID,
                    'productInfo' => $productInfo
                ];
            }
        }

        if (count($productByCateg) == 0 && count($allProduct) == 0) {
            $message = 'Oops! No product found!';
            return response(compact('message'));
        }

        return response()->json(count($productByCateg) > 0 ? $productByCateg : $allProduct);
    }

    public function getProductByPriceRange(Request $request)
    {
        $productByPriceRange = [];
        foreach ($this->database->getReference('products')->getSnapshot()->getValue() as $productID => $productInfo) {
            if ($productInfo['productPrice'] >= $request->minimumPrice && $productInfo['productPrice'] <= $request->maximumPrice) {
                $productByPriceRange[] = [
                    'productID' => $productID,
                    'productInfo' => $productInfo
                ];
            }
        }

        if (count($productByPriceRange) == 0) {
            $message = 'Nani';
            return response(compact('message'));
        }

        return response()->json($productByPriceRange);
    }

    public function insertProduct(Request $request)
    {
        $productImageNames = [];
        $uploadedImagesCount = 0;

        // check if DB is empty
        if ($this->database->getReference('products')->getSnapshot()->exists() && $this->database->getReference('products')->getSnapshot()->hasChildren()) {
            $isDuplicated = false;
            foreach ($this->database->getReference('products')->getSnapshot()->getValue() as $productInfo) {
                if ($request->productName == $productInfo['productName']) {
                    $isDuplicated = true;
                    break;
                }
            }

            if ($isDuplicated) {

                $message = 'Adding the product failed, the product already exists';
                return response(compact('message'));
            }
        }

        ($request->productDescription != null) ? $description = $request->productDescription : $description = "No Product Description";

        for ($i = 1; $i <= 3; $i++) {
            if ($request->hasFile("productFile{$i}")) {
                $uploadedImagesCount++;
                $productImageFile = $request->file("productFile{$i}");
                $productImageName = 'products/' . time() . '_' . $productImageFile->getClientOriginalName();

                $this->storage->getBucket()->upload($productImageFile->getContent(), [
                    'name' => $productImageName
                ]);

                $fireBaseStoragePath = $productImageName;
                $productImageURL = $this->storage->getBucket()->object($fireBaseStoragePath)->signedUrl(new \DateTime('3000-01-01T00:00:00Z'));
                $productImageURLs[] = $productImageURL;
            }
        }

        $totalQuantity = $request->productCategory === 'Caps' ? $request->totalQuantity : $request->smallQuantity + $request->mediumQuantity + $request->largeQuantity + $request->extraLargeQuantity;

        $productData = [
            'productName' => $request->productName,
            'productPrice' => $request->productPrice,
            'productQuantity' => $totalQuantity,
            'productCriticalLevel' => $request->productCriticalLevelQuantity,
            'smallQuantity' => $request->smallQuantity ? $request->smallQuantity : 0,
            'mediumQuantity' => $request->mediumQuantity ? $request->mediumQuantity : 0,
            'largeQuantity' => $request->largeQuantity ? $request->largeQuantity : 0,
            'extraLargeQuantity' => $request->extraLargeQuantity ? $request->extraLargeQuantity : 0,
            'doubleXLQuantity' => $request->doubleXLQuantity ? $request->doubleXLQuantity : 0,
            'tripleXLQuantity' => $request->tripleXLQuantity ? $request->tripleXLQuantity : 0,
            'productDescription' => $description,
            'isVisible' => true,
            'isCriticalLevel' => false,
            'productImage' => $productImageURLs[0] ?? '', 
            'productImage1' => $productImageURLs[1] ?? '', 
            'productImage2' => $productImageURLs[2] ?? '', 
            'productCategory' => $request->productCategory,
            'dateAdded' => Carbon::now()->toDateString(), 
            'totalSold' => 0,
            'productRatings' => 0,
            'productFiveStarCount' => 0,
            'productFourStarCount' => 0,
            'productThreeStarCount' => 0,
            'productTwoStarCount' => 0,
            'productOneStarCount' => 0,
            'productTotalStarCount' => 0,
        ];

        //insert
        $this->database->getReference('products')->push($productData);
        $message = 'Product Added!';
        return response(compact('message'));
    }

    public function editProduct(Request $request)
    {
        $productImageNames = [];
        $uploadedImagesCount = 0;

        //validate if the admin decided to the change the name of the product but it the product is already existing in the database
        if ($this->database->getReference('products')->getSnapshot()->exists() && $this->database->getReference('products')->getSnapshot()->hasChildren()) {
            $isDuplicated = false;
            foreach ($this->database->getReference('products')->getSnapshot()->getValue() as $productID => $productInfo) {
                if ($request->productName == $productInfo['productName'] && $request->productID != $productID) {
                    $isDuplicated = true;
                    break;
                }
            }

            if ($isDuplicated) {

                $message = 'Editing this product failed, product with the same name existed!';
                return response(compact('message'));
            }
        }

        for ($i = 1; $i <= 3; $i++) {
            if ($request->hasFile("productFile{$i}")) {
                $uploadedImagesCount++;
                $productImageFile = $request->file("productFile{$i}");
                $productImageName = 'products/' . time() . '_' . $productImageFile->getClientOriginalName(); 

                $this->storage->getBucket()->upload($productImageFile->getContent(), [
                    'name' => $productImageName
                ]);
               
                $fireBaseStoragePath = $productImageName;
                $productImageURL = $this->storage->getBucket()->object($fireBaseStoragePath)->signedUrl(new \DateTime('3000-01-01T00:00:00Z'));
                $productImageURLs[] = $productImageURL;
            }
        }

        foreach ($this->database->getReference('products')->getSnapshot()->getValue() as $productID => $productInfo) {
            if ($request->productID == $productID) {

                $newTotalQnt = $request->smallQuantity + $request->mediumQuantity + $request->largeQuantity + $request->extraLargeQuantity;
                $request->isUnlisted === 'false' ? $visiblity = true : $visiblity = false;
                //update the child based on product ID
                $this->database->getReference('products/' . $request->productID)->update([

                    'dateEdited' => Carbon::now()->toDateString(),
                    'dateAdded' => $productInfo['dateAdded'],
                    'productImage' => $productImageURLs[0] ?? $productInfo['productImage'], 
                    'productImage1' => $productImageURLs[1] ?? $productInfo['productImage1'], 
                    'productImage2' => $productImageURLs[2] ?? $productInfo['productImage2'], 
                    'isVisible' => $visiblity,
                    'isCriticalLevel' => $newTotalQnt <= $productInfo['productCriticalLevel'] ? true : false,
                    'productName' => $request->productName ? $request->productName : $productInfo['productName'],
                    'productPrice' => $request->productPrice ? $request->productPrice : $productInfo['productPrice'],
                    'productCategory' => $request->productCategory ? $request->productCategory : $productInfo['productCategory'],
                    'productCriticalLevel' => $request->productCriticalLevelQuantity ? $request->productCriticalLevelQuantity : $productInfo['productCriticalLevel'],
                    'productDescription' => $request->productDescription ? $request->productDescription : $productInfo['productDescription'],
                    'productQuantity' => $newTotalQnt,
                    'smallQuantity' => $request->smallQuantity ? $request->smallQuantity : $productInfo['smallQuantity'],
                    'mediumQuantity' => $request->mediumQuantity ? $request->mediumQuantity : $productInfo['mediumQuantity'],
                    'largeQuantity' => $request->largeQuantity ? $request->largeQuantity : $productInfo['largeQuantity'],
                    'extraLargeQuantity' => $request->extraLargeQuantity ? $request->extraLargeQuantity : $productInfo['extraLargeQuantity'],
                    'doubleXLQuantity' => $request->doubleXLQuantity ? $request->doubleXLQuantity : $productInfo['doubleXLQuantity'],
                    'tripleXLQuantity' => $request->tripleXLQuantity ? $request->tripleXLQuantity : $productInfo['tripleXLQuantity'],
                    'totalSold' => $productInfo['totalSold'],
                    'productRatings' => $productInfo['productRatings'],

                    //quality stars count
                    'productFiveStarCount' => $productInfo['productFiveStarCount'],
                    'productFourStarCount' => $productInfo['productFourStarCount'],
                    'productThreeStarCount' => $productInfo['productThreeStarCount'],
                    'productTwoStarCount' => $productInfo['productTwoStarCount'],
                    'productOneStarCount' => $productInfo['productOneStarCount'],
                    'productTotalStarCount' => $productInfo['productTotalStarCount'],

                ]);
            }
        }

        $message = 'Product Updated!';
        return response(compact('message'));
    }
}