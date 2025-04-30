# Collaborative Coding Platform

Future enhancements:
- leaderboard
- Support for other types like:
    - List<Double>
    - List<Boolean>
    - List<List<Integer>>
    - Map<String, String>

    List<Double> → add:
    ```java
    case "List<Double>" -> mapper.convertValue(argNode, TypeFactory.defaultInstance().constructCollectionType(List.class, Double.class));
    ```

    Map<String, String> → add:
    ```java
    case "Map<String,String>" -> mapper.convertValue(argNode, TypeFactory.defaultInstance().constructMapType(Map.class, String.class, String.class));
    ```

    Just remember:

    Stick to exact type name strings (e.g., "List<Double>" in the parameters list)

    Always update both:
        - parseParameterTypes() (if you need it for method lookup)
        - parseArguments() (for correct deserialization)

    And if anything throws a ClassCastException or IllegalArgumentException, you'll know where to patch.

- Admin control button to reload questions to avoid restart
- Admin control to have dropdown for known return type + custom via text box.
- questions and test cases ask chatgpt
- Let me know if you'd like to support nested lists (e.g. List<List<Integer>>) or add output normalization for unordered maps.


# Sample solutions

### Sqrt
```java
public class Solution {
    public int mySqrt(int x) {
        if(x==0){
            return 0;
        }
        int low=1;int high=x;int result=0;
        while(low<=high){
            int mid=low+(high-low)/2;
            if(mid<=x/mid){
                result=mid;
                low=mid+1;
            }else{
                high=mid-1;
            }
        }
        return result;
    }
}
```

### Two Sum
```java
public class Solution {
      public int[] twoSum(int[] arr, int val) {
          // your code here
          for(int i=0;i<arr.length;i++){
            for(int j=i+1;j<arr.length;j++){
                if(arr[i]+arr[j]==val){
                    int[] kaka={i,j};     
                    return kaka;           }
            }
        }
        
        return new int[]{};
      }
  }
```