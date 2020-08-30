import {HttpClient} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {API_URL} from 'src/app/api-url';

export interface UndefinedNode {
  $: 'undefined';
}

export interface NullNode {
  $: 'null';
}

export interface StringNode {
  $: 'string';
  v: string;
}

export interface NumberNode {
  $: 'number';
  v: number;
}

export interface BooleanNode {
  $: 'boolean';
  v: boolean;
}

export interface ObjectNode {
  $: 'object';
  v?: { [key: string]: Node };
}

export interface ArrayNode {
  $: 'array';
  v?: Node[];
}

export interface FunctionNode {
  $: 'function';
  v: string | null;
}

export type Node
  = UndefinedNode
  | NullNode
  | StringNode
  | NumberNode
  | BooleanNode
  | ObjectNode
  | ArrayNode
  | FunctionNode;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(
    @Inject(API_URL) private readonly apiUrl: string,
    private readonly httpClient: HttpClient,
  ) {
    console.log(apiUrl);
    this.loadSubtree(null).subscribe(console.log);
  }

  loadSubtree(selector: string | null): Observable<Node> {
    return this.httpClient.get<Node>(this.apiUrl, {params: selector ? {q: selector} : {}});
  }
}
