#!/usr/bin/env python
# coding: utf-8

# In[ ]:


import dash
from dash import dcc, html
from dash.dependencies import Input, Output
import plotly.graph_objects as go
import networkx as nx
from collections import Counter
import itertools
import community
import os

# Initialize the Dash app
external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']
app = dash.Dash(__name__, external_stylesheets=external_stylesheets)
app.title = "Hashtag Co-occurrence Network Analysis"

# Get unique periods from your data for the dropdown
periods = sorted(df_complete['period'].unique())
period_options = [{'label': str(p), 'value': str(p)} for p in periods]

# Layout of the web app
app.layout = html.Div([
    html.H1("Hashtag Co-occurrence Network Focused on digitalnomad"),
    html.P("Select a time period to view the co-occurrence network of hashtags appearing with 'digitalnomad'."),
    dcc.Dropdown(
        id='period-dropdown',
        options=period_options,
        value=period_options[0]['value'] if period_options else None,
        placeholder="Select a time period",
        style={'width': '50%'}
    ),
    dcc.Graph(id='network-graph', style={'height': '700px'})
])

# Callback to update the graph based on selected period
@app.callback(
    Output('network-graph', 'figure'),
    [Input('period-dropdown', 'value')]
)
def update_network_graph(selected_period):
    if not selected_period:
        return go.Figure()
    
    df_period = df_complete[df_complete['period'] == selected_period]
    df_focused = df_period[df_period['hashtagNames'].apply(
        lambda x: 'digitalnomad' in x if isinstance(x, list) else False
    )]
    
    if df_focused.empty:
        return go.Figure().update_layout(
            title=dict(text=f"No data for 'digitalnomad' in {selected_period}", font=dict(size=16))
        )
    
    co_occurrences = Counter()
    for hashtags in df_focused['hashtagNames']:
        if isinstance(hashtags, list) and len(hashtags) > 1:
            for pair in itertools.combinations(sorted(set(hashtags)), 2):
                co_occurrences[pair] += 1

    G = nx.Graph()
    for (h1, h2), weight in co_occurrences.items():
        G.add_edge(h1, h2, weight=weight)

    min_degree = 3
    min_weight = 2
    nodes_to_keep = [n for n, d in G.degree() if d >= min_degree]
    G_filtered = G.subgraph(nodes_to_keep)
    edges_to_keep = [(u, v) for u, v, d in G_filtered.edges(data=True) if d['weight'] >= min_weight]
    G_filtered = nx.Graph(edges_to_keep)

    if G_filtered.number_of_nodes() == 0 or G_filtered.number_of_edges() == 0:
        return go.Figure().update_layout(
            title=dict(text=f"No significant network for 'digitalnomad' in {selected_period} after filtering", font=dict(size=16))
        )

    centrality = nx.degree_centrality(G_filtered)
    node_sizes = [20 + 80 * centrality.get(n, 0) for n in G_filtered.nodes()]
    partition = community.best_partition(G_filtered)
    node_colors = [partition.get(n, 0) for n in G_filtered.nodes()]
    pos = nx.spring_layout(G_filtered, k=0.5, iterations=50)

    edge_x, edge_y = [], []
    for u, v in G_filtered.edges():
        x0, y0 = pos[u]
        x1, y1 = pos[v]
        edge_x.extend([x0, x1, None])
        edge_y.extend([y0, y1, None])

    node_x, node_y = [], []
    node_text = []
    for node in G_filtered.nodes():
        x, y = pos[node]
        node_x.append(x)
        node_y.append(y)
        node_text.append(f"Hashtag: {node}<br>Degree Centrality: {centrality.get(node, 0):.2f}<br>Community: {partition.get(node, 0)}")

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=edge_x, y=edge_y,
        mode='lines',
        line=dict(width=0.5, color='#888'),
        hoverinfo='none',
        showlegend=False
    ))
    fig.add_trace(go.Scatter(
        x=node_x, y=node_y,
        mode='markers',
        marker=dict(
            size=node_sizes,
            color=node_colors,
            colorscale='Viridis',
            showscale=True,
            colorbar=dict(title="Community")
        ),
        text=node_text,
        hoverinfo='text',
        showlegend=False
    ))
    fig.update_layout(
        title=dict(
            text=f"Hashtag Co-occurrence Network for digitalnomad ({selected_period})",
            font=dict(size=16)
        ),
        showlegend=False,
        hovermode='closest',
        margin=dict(b=20, l=5, r=5, t=40),
        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        width=900,
        height=700
    )
    return fig

# Run the app (for local testing before deployment)
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8050)


